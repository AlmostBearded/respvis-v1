import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
} from '../chart-window';
import { arrayIs, arrayIs2D } from '../core';
import { chartBar, chartBarData, ChartBar } from './chart-bar';
import { ChartBarGrouped } from './chart-bar-grouped';
import { SeriesLabelBar } from './series-label-bar';

export interface ChartWindowBar extends ChartBar {
  categoryEntity: string;
  valueEntity: string;
  valueDomain: number[] | ((values: number[]) => number[]);
}

export function chartWindowBarData(data: Partial<ChartWindowBar>): ChartWindowBar {
  const chartData = chartBarData(data),
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

export function chartWindowBar(selection: Selection<HTMLDivElement, ChartWindowBar>): void {
  selection
    .classed('chart-window-bar', true)
    .call((s) => chartWindow(s))
    .each((chartWindowD, i, g) => {
      const chartWindow = select<HTMLDivElement, ChartWindowBar>(g[i]),
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

      // download svg
      menuItems.append('li').call((s) => toolDownloadSVG(s));

      chartWindow.on('change.chartwindowbar', function () {
        chartWindowBarApplyFilters(select<Element, ChartWindowBar>(this));
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(chartBarData(chartWindowD))
        .call((s) => chartBar(s));

      chart.selectAll('.legend').attr('cursor', 'default');

      chartWindow.on('datachange.chartwindowbar', function (e, chartWindowD) {
        const chartWindowS = select<Element, ChartWindowBar>(this),
          categoryFilterS = chartWindowS.selectAll<Element, ToolFilterNominal>(
            '.tool-filter-categories'
          ),
          categoryFilterD = categoryFilterS.datum(),
          filterOptionMap = (data: ToolFilterNominal) =>
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

export function chartWindowBarApplyFilters(selection: Selection<Element, ChartWindowBar>): void {
  selection.each((chartWindowD, i, g) => {
    const {
        categories,
        values,
        keys,
        colors,
        valueDomain,
        labels: { labels: labels },
      } = chartWindowD,
      chartWindowS = select<Element, ChartWindowBar>(g[i]),
      chartS = chartWindowS.selectAll<Element, ChartBarGrouped>('svg.chart-bar'),
      labelSeriesS = chartS.selectAll<Element, SeriesLabelBar>('.series-label-bar'),
      catFilterD = chartWindowS
        .selectAll<Element, ToolFilterNominal>('.tool-filter-categories')
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
        Object.assign(d, chartBarData(chartWindowD), {
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
