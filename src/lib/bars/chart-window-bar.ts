import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  DataToolFilterNominal,
  dataToolFilterNominal,
  toolDownloadSVG,
  toolFilterNominal,
} from '../chart-window';
import { arrayIs, arrayIs2D } from '../core';
import { chartBar, dataChartBar, DataChartBar } from './chart-bar';
import { DataChartBarGrouped } from './chart-bar-grouped';
import { DataSeriesLabelBar } from './series-label-bar';

export interface DataChartWindowBar extends DataChartBar {
  categoryEntity: string;
  valueEntity: string;
  valueDomain: number[] | ((values: number[]) => number[]);
}

export function dataChartWindowBar(data: Partial<DataChartWindowBar>): DataChartWindowBar {
  const chartData = dataChartBar(data),
    valueDomain = data.valueDomain || ((values) => [0, Math.max(...values) * 1.05]);

  chartData.valueScale.domain(
    valueDomain instanceof Function ? valueDomain(chartData.values) : valueDomain
  );

  return {
    ...chartData,
    categoryEntity: data.categoryEntity || '',
    valueEntity: data.valueEntity || '',
    valueDomain: valueDomain,
  };
}

export function chartWindowBar(selection: Selection<HTMLDivElement, DataChartWindowBar>): void {
  selection
    .classed('chart-window-bar', true)
    .call((s) => chartWindow(s))
    .each((chartWindowD, i, g) => {
      const chartWindow = select<HTMLDivElement, DataChartWindowBar>(g[i]),
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

      // download svg
      menuItems.append('li').call((s) => toolDownloadSVG(s));

      chartWindow.on('change.chartwindowbar', function () {
        chartWindowBarApplyFilters(select<Element, DataChartWindowBar>(this));
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(dataChartBar(chartWindowD))
        .call((s) => chartBar(s));

      chart.selectAll('.legend').attr('cursor', 'default');

      chartWindow.on('datachange.chartwindowbar', function (e, chartWindowD) {
        const chartWindowS = select<Element, DataChartWindowBar>(this),
          categoryFilterS = chartWindowS.selectAll<Element, DataToolFilterNominal>(
            '.tool-filter-categories'
          ),
          categoryFilterD = categoryFilterS.datum(),
          filterOptionMap = (data: DataToolFilterNominal) =>
            data.options.reduce<Record<string, boolean>>(
              (obj, option, i) => Object.assign(obj, { [`${option}`]: data.shown[i] }),
              {}
            ),
          categoryOptionMap = filterOptionMap(categoryFilterD),
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

        chartWindowBarApplyFilters(chartWindowS);
      });
    });
}

export function chartWindowBarApplyFilters(
  selection: Selection<Element, DataChartWindowBar>
): void {
  selection.each((chartWindowD, i, g) => {
    const {
        categories,
        values,
        keys,
        colors,
        valueDomain,
        labels: { labels: labels },
      } = chartWindowD,
      chartWindowS = select<Element, DataChartWindowBar>(g[i]),
      chartS = chartWindowS.selectAll<Element, DataChartBarGrouped>('svg.chart-bar'),
      labelSeriesS = chartS.selectAll<Element, DataSeriesLabelBar>('.series-label'),
      catFilterD = chartWindowS
        .selectAll<Element, DataToolFilterNominal>('.tool-filter-categories')
        .datum(),
      filterCat = (_, i: number) => catFilterD.shown[i];

    const filteredCats = categories.filter(filterCat),
      filteredValues = values.filter(filterCat),
      filteredKeys = keys?.filter(filterCat),
      filteredColors = arrayIs(colors) ? colors.filter(filterCat) : colors,
      filteredLabels = arrayIs(labels) && labels.filter(filterCat),
      filteredValueDomain =
        valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

    chartS.datum(
      (d) => (
        d.categoryScale.domain(filteredCats),
        d.valueScale.domain(filteredValueDomain).nice(),
        Object.assign(d, dataChartBar(chartWindowD), {
          categories: filteredCats,
          values: filteredValues,
          keys: filteredKeys,
          colors: filteredColors,
          labels: {
            ...chartWindowD.labels,
            ...(filteredLabels && { labels: filteredLabels }),
          },
        })
      )
    );
  });
}
