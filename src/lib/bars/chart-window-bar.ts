import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
} from '../chart-window';
import { arrayIs, arrayIs2D, Position } from '../core';
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
    categoryEntity: data.categoryEntity || 'Categories',
    valueEntity: data.valueEntity || 'Values',
    valueDomain: valueDomain,
  };
}

export type ChartWindowBarSelection = Selection<HTMLDivElement, ChartWindowBar>;

export function chartWindowBar(selection: ChartWindowBarSelection): void {
  selection
    .classed('chart-window-bar', true)
    .on('resize.chartwindowbar', function (e, d) {
      chartWindowBarDispatchDensityChange(select(this));
    })
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
        chartWindowBarApplyFilters(<ChartWindowBarSelection>select(this));
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(chartBarData(chartWindowD))
        .call((s) => chartBar(s));

      chartWindow.on('datachange.chartwindowbar', function (e, chartWindowD) {
        const chartWindowS = <ChartWindowBarSelection>select(this),
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

export function chartWindowBarApplyFilters(selection: ChartWindowBarSelection): void {
  selection.each((chartWindowD, i, g) => {
    const {
        categories,
        values,
        keys,
        valueDomain,
        labels: { labels: labels },
      } = chartWindowD,
      chartWindowS = <ChartWindowBarSelection>select(g[i]),
      chartS = chartWindowS.selectAll<Element, ChartBarGrouped>('svg.chart-bar'),
      labelSeriesS = chartS.selectAll<Element, SeriesLabelBar>('.series-label-bar'),
      catFilterD = chartWindowS
        .selectAll<Element, ToolFilterNominal>('.tool-filter-categories')
        .datum(),
      filterCat = (_, i: number) => catFilterD.shown[i];

    const filteredCats = categories.filter(filterCat),
      filteredValues = values.filter(filterCat),
      filteredKeys = keys?.filter(filterCat),
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
          labels: {
            ...chartWindowD.labels,
            ...(filteredLabels && { labels: filteredLabels }),
          },
        })
      )
    );

    // chartWindowBarDispatchDensityChange(chartWindowS);
  });
}

export function chartWindowBarDispatchDensityChange(selection: ChartWindowBarSelection): void {
  selection.each((d, i, g) => {
    const { width, height } = g[i].getBoundingClientRect();
    const { values } = select(g[i]).selectAll<Element, ChartBar>('.chart-bar').datum();
    select(g[i]).dispatch('densitychange', {
      detail: { density: { x: values.length / width, y: values.length / height } },
    });
  });
}
