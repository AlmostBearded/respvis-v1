import { max } from 'd3-array';
import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  DataToolFilterNominal,
  dataToolFilterNominal,
  toolDownloadSVG,
  toolFilterNominal,
} from '../chart-window';
import { arrayFlat, arrayIs, arrayIs2D, arrayPartition } from '../core';
import { chartBarStacked, dataChartBarStacked, DataChartBarStacked } from './chart-bar-stacked';
import { DataSeriesLabelBar } from './series-label-bar';

export interface DataChartWindowBarStacked extends DataChartBarStacked {
  categoryEntity: string;
  subcategoryEntity: string;
  valueEntity: string;
  valueDomain: number[] | ((values: number[][]) => number[]);
  valuesAsRatios: boolean;
}

export function dataChartWindowBarStacked(
  data: Partial<DataChartWindowBarStacked>
): DataChartWindowBarStacked {
  const chartData = dataChartBarStacked(data),
    valueDomain =
      data.valueDomain ||
      ((values) => [0, Math.max(...values.map((catV) => Math.max(...catV))) * 1.05]);

  chartData.valueScale.domain(
    valueDomain instanceof Function ? valueDomain(chartData.values) : valueDomain
  );

  return {
    ...chartData,
    categoryEntity: data.categoryEntity || '',
    subcategoryEntity: data.subcategoryEntity || '',
    valueEntity: data.valueEntity || '',
    valueDomain: valueDomain,
    valuesAsRatios: data.valuesAsRatios || false,
  };
}

export function chartWindowBarStacked(
  selection: Selection<HTMLDivElement, DataChartWindowBarStacked>
): void {
  selection
    .classed('chart-window-bar-stacked', true)
    .call((s) => chartWindow(s))
    .each((chartWindowD, i, g) => {
      const chartWindow = select<HTMLDivElement, DataChartWindowBarStacked>(g[i]),
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

      chartWindow.on('change.chartwindowbarstacked', function () {
        chartWindowBarStackedApplyFilters(select<Element, DataChartWindowBarStacked>(this));
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(dataChartBarStacked(chartWindowD))
        .call((s) => chartBarStacked(s));

      chart.selectAll('.legend').attr('cursor', 'default');

      chartWindow.on('datachange.chartwindowbarstacked', function (e, chartWindowD) {
        const chartWindowS = select<Element, DataChartWindowBarStacked>(this),
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

        chartWindowBarStackedApplyFilters(chartWindowS);
      });
    });
}

export function chartWindowBarStackedApplyFilters(
  selection: Selection<Element, DataChartWindowBarStacked>
): void {
  selection.each((chartWindowD, i, g) => {
    const {
        categories,
        subcategories,
        values,
        keys,
        colors,
        valueDomain,
        valuesAsRatios,
        legend: { colors: legendColors },
        labels: { labels: labels },
      } = chartWindowD,
      chartWindowS = select<Element, DataChartWindowBarStacked>(g[i]),
      chartS = chartWindowS.selectAll<Element, DataChartBarStacked>('svg.chart-bar-stacked'),
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
      filteredValues = values
        .filter(filterCat)
        .map((catValues) => catValues.filter(filterSubcat))
        .map((catValues) => {
          if (!valuesAsRatios) return catValues;
          const sum = catValues.reduce((prev, curr) => prev + curr, 0);
          return catValues.map((v) => (v / sum) * 100 || 0);
        }),
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
        Object.assign(d, dataChartBarStacked(chartWindowD), {
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
