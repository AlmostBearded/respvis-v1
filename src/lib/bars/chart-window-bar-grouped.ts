import { max } from 'd3-array';
import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
} from '../chart-window';
import { arrayFlat, arrayIs, arrayIs2D, arrayPartition } from '../core';
import { chartBarGrouped, chartBarGroupedData, ChartBarGrouped } from './chart-bar-grouped';
import { SeriesLabelBar } from './series-label-bar';

export interface ChartWindowBarGrouped extends ChartBarGrouped {
  categoryEntity: string;
  subcategoryEntity: string;
  valueEntity: string;
  valueDomain: number[] | ((values: number[][]) => number[]);
}

export function chartWindowBarGroupedData(
  data: Partial<ChartWindowBarGrouped>
): ChartWindowBarGrouped {
  const chartData = chartBarGroupedData(data),
    valueDomain =
      data.valueDomain ||
      ((values) => [0, Math.max(...values.map((catV) => Math.max(...catV))) * 1.05]);

  chartData.valueScale.domain(
    valueDomain instanceof Function ? valueDomain(chartData.values) : valueDomain
  );

  return {
    ...chartData,
    categoryEntity: data.categoryEntity || 'Categories',
    subcategoryEntity: data.subcategoryEntity || 'Subcategories',
    valueEntity: data.valueEntity || 'Values',
    valueDomain: valueDomain,
  };
}

export function chartWindowBarGrouped(
  selection: Selection<HTMLDivElement, ChartWindowBarGrouped>
): void {
  selection
    .classed('chart-window-bar-grouped', true)
    .call((s) => chartWindow(s))
    .each((chartWindowD, i, g) => {
      const chartWindow = select<HTMLDivElement, ChartWindowBarGrouped>(g[i]),
        menuItems = chartWindow.selectAll('.menu-tools .items'),
        layouter = chartWindow.selectAll('.layouter');

      // category filter
      menuItems
        .append('li')
        .classed('tool-filter-categories', true)
        .datum(
          toolFilterNominalData({
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
          toolFilterNominalData({
            text: chartWindowD.subcategoryEntity,
            options: chartWindowD.subcategories,
          })
        )
        .call(toolFilterNominal);

      // download svg
      menuItems.append('li').call((s) => toolDownloadSVG(s));

      chartWindow.on('change.chartwindowbargrouped', function () {
        chartWindowBarGroupedApplyFilters(select<Element, ChartWindowBarGrouped>(this));
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(chartBarGroupedData(chartWindowD))
        .call((s) => chartBarGrouped(s));

      chart.selectAll('.legend').attr('cursor', 'default');

      chartWindow.on('datachange.chartwindowbargrouped', function (e, chartWindowD) {
        const chartWindowS = select<Element, ChartWindowBarGrouped>(this),
          categoryFilterS = chartWindowS.selectAll<Element, ToolFilterNominal>(
            '.tool-filter-categories'
          ),
          categoryFilterD = categoryFilterS.datum(),
          subcategoryFilterS = chartWindowS.selectAll<Element, ToolFilterNominal>(
            '.tool-filter-subcategories'
          ),
          subcategoryFilterD = subcategoryFilterS.datum(),
          filterOptionMap = (data: ToolFilterNominal) =>
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
  selection: Selection<Element, ChartWindowBarGrouped>
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
        labels: { labels: labels },
      } = chartWindowD,
      chartWindowS = select<Element, ChartWindowBarGrouped>(g[i]),
      chartS = chartWindowS.selectAll<Element, ChartBarGrouped>('svg.chart-bar-grouped'),
      labelSeriesS = chartS.selectAll<Element, SeriesLabelBar>('.series-label-bar'),
      catFilterD = chartWindowS
        .selectAll<Element, ToolFilterNominal>('.tool-filter-categories')
        .datum(),
      subcatFilterD = chartWindowS
        .selectAll<Element, ToolFilterNominal>('.tool-filter-subcategories')
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
      filteredLabels =
        arrayIs(labels) &&
        arrayFlat(
          arrayPartition(labels, subcategories.length)
            .filter(filterCat)
            .map((v) => v.filter(filterSubcat))
        ),
      filteredValueDomain =
        valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

    chartS.datum(
      (d) => (
        d.categoryScale.domain(filteredCats),
        d.valueScale.domain(filteredValueDomain).nice(),
        Object.assign(d, chartBarGroupedData(chartWindowD), {
          categories: filteredCats,
          subcategories: filteredSubcats,
          values: filteredValues,
          keys: filteredKeys,
          colors: filteredColors,
          legend: {
            ...chartWindowD.legend,
            ...(filteredLegendColors && { colors: filteredLegendColors }),
          },
          labels: {
            ...chartWindowD.labels,
            ...(filteredLabels && { labels: filteredLabels }),
          },
        })
      )
    );
  });
}
