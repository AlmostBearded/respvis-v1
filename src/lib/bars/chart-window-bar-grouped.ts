import { max } from 'd3-array';
import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  DataToolFilterNominal,
  dataToolFilterNominal,
  toolDownloadSVG,
  toolFilterNominal,
} from '../chart-window';
import { arrayIs, arrayIs2D } from '../core';
import { chartBarGrouped, dataChartBarGrouped, DataChartBarGrouped } from './chart-bar-grouped';
import { DataSeriesLabelBar } from './series-label-bar';

export interface DataChartWindowBarGrouped extends DataChartBarGrouped {
  categoryEntity: string;
  subcategoryEntity: string;
  valueEntity: string;
  valueDomain: number[] | ((values: number[][]) => number[]);
}

export function dataChartWindowBarGrouped(
  data: Partial<DataChartWindowBarGrouped>
): DataChartWindowBarGrouped {
  return {
    ...dataChartBarGrouped(data),
    categoryEntity: data.categoryEntity || '',
    subcategoryEntity: data.subcategoryEntity || '',
    valueEntity: data.valueEntity || '',
    valueDomain:
      data.valueDomain ||
      ((values) => [0, Math.max(...values.map((catV) => Math.max(...catV))) * 1.05]),
  };
}

export function chartWindowBarGrouped(
  selection: Selection<HTMLDivElement, DataChartWindowBarGrouped>
): void {
  selection
    .classed('chart-window-bar-grouped', true)
    .call((s) => chartWindow(s))
    .each((chartWindowD, i, g) => {
      const chartWindow = select<HTMLDivElement, DataChartWindowBarGrouped>(g[i]),
        menuItems = chartWindow.selectAll('.menu-tools .items'),
        layouter = chartWindow.selectAll('.layouter');

      // category filter
      menuItems
        .append('li')
        .classed('tool-filter-categories', true)
        .datum(
          dataToolFilterNominal({
            text: chartWindowD.categoryEntity,
            options: chartWindowD.categories,
          })
        )
        .call(toolFilterNominal);

      // subcategory filter
      menuItems
        .append('li')
        .classed('tool-filter-subcategories', true)
        .datum(
          dataToolFilterNominal({
            text: chartWindowD.subcategoryEntity,
            options: chartWindowD.subcategories,
          })
        )
        .call(toolFilterNominal);

      // download svg
      menuItems.append('li').call((s) => toolDownloadSVG(s));

      chartWindow.on('change', function () {
        select<Element, DataChartWindowBarGrouped>(this).call((s) =>
          chartWindowBarGroupedApplyFilters(s)
        );
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(dataChartBarGrouped(chartWindowD))
        .call((s) => chartBarGrouped(s));

      chart.selectAll('.legend').attr('cursor', 'default');

      chartWindow.on('datachange.chartwindowbargrouped', function (e, chartWindowD) {
        const chartWindowS = select<Element, DataChartWindowBarGrouped>(this),
          categoryFilterS = chartWindowS.selectAll<Element, DataToolFilterNominal>(
            '.tool-filter-categories'
          ),
          categoryFilterD = categoryFilterS.datum(),
          subcategoryFilterS = chartWindowS.selectAll<Element, DataToolFilterNominal>(
            '.tool-filter-subcategories'
          ),
          subcategoryFilterD = subcategoryFilterS.datum(),
          filterOptionMap = (data: DataToolFilterNominal) =>
            data.options.reduce<Record<string, boolean>>(
              (obj, option, i) => Object.assign(obj, { [`${option}`]: data.shown[i] }),
              {}
            ),
          categoryOptionMap = filterOptionMap(categoryFilterD),
          subcategoryOptionMap = filterOptionMap(subcategoryFilterD),
          filterDatum = (text: string, options: string[], optionMap: Record<string, boolean>) => ({
            text: text,
            options: options,
            shown: options.map((o) => (optionMap[o] === undefined ? true : optionMap[o])),
          });

        categoryFilterS.datum((d) =>
          Object.assign(
            d,
            filterDatum(chartWindowD.categoryEntity, chartWindowD.categories, categoryOptionMap)
          )
        );

        subcategoryFilterS.datum((d) =>
          Object.assign(
            d,
            filterDatum(
              chartWindowD.subcategoryEntity,
              chartWindowD.subcategories,
              subcategoryOptionMap
            )
          )
        );

        chartWindowBarGroupedApplyFilters(chartWindowS);
      });
    });
}

export function chartWindowBarGroupedApplyFilters(
  selection: Selection<Element, DataChartWindowBarGrouped>
): void {
  selection.each((chartWindowD, i, g) => {
    const {
        categories,
        subcategories,
        values,
        keys,
        colors,
        valueDomain,
        legend: { colors: legendColors },
      } = chartWindowD,
      chartWindowS = select<Element, DataChartWindowBarGrouped>(g[i]),
      chartS = chartWindowS.selectAll<Element, DataChartBarGrouped>('svg.chart-bar-grouped'),
      labelSeriesS = chartS.selectAll<Element, DataSeriesLabelBar>('.series-label'),
      catFilterD = chartWindowS
        .selectAll<Element, DataToolFilterNominal>('.tool-filter-categories')
        .datum(),
      subcatFilterD = chartWindowS
        .selectAll<Element, DataToolFilterNominal>('.tool-filter-subcategories')
        .datum(),
      filterCat = (_, i: number) => catFilterD.shown[i],
      filterSubcat = (_, i: number) => subcatFilterD.shown[i];

    const filteredCats = categories.filter(filterCat),
      filteredSubcats = subcategories.filter(filterSubcat),
      filteredValues = values.filter(filterCat).map((v) => v.filter(filterSubcat)),
      filteredKeys = keys?.filter(filterCat).map((v) => v.filter(filterSubcat)),
      filteredColors = arrayIs2D(colors)
        ? colors.filter(filterCat).map((v) => v.filter(filterSubcat))
        : arrayIs(colors)
        ? colors.filter(filterSubcat)
        : colors,
      filteredLegendColors = arrayIs(legendColors)
        ? legendColors.filter(filterSubcat)
        : legendColors,
      filteredValueDomain =
        valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

    chartS.datum(
      (d) => (
        d.categoryScale.domain(filteredCats),
        d.valueScale.domain(filteredValueDomain).nice(),
        Object.assign(d, dataChartBarGrouped(chartWindowD), {
          categories: filteredCats,
          subcategories: filteredSubcats,
          values: filteredValues,
          keys: filteredKeys,
          colors: filteredColors,
          legend: {
            ...chartWindowD.legend,
            ...(filteredLegendColors && { colors: filteredLegendColors }),
          },
        })
      )
    );
    labelSeriesS.datum(
      (d) => ((d.labels = filteredValues.reduce((out, v) => (out.push(...v), out), [])), d)
    );
  });
}
