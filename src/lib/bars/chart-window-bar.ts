import { select, Selection } from 'd3';
import {
  chartWindowRender,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVGRender,
  toolFilterNominalRender,
  Checkbox,
  layouterCompute,
} from '../core';
import { arrayIs } from '../core';
import { chartBar, chartBarData, ChartBar } from './chart-bar';

export interface ChartWindowBar extends ChartBar {
  categoryActiveStates: boolean[];
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
    categoryActiveStates: data.categoryActiveStates || chartData.categories.map(() => true),
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
    .call((s) => chartWindowRender(s))
    .each((chartWindowD, i, g) => {
      const {
        categoryActiveStates,
        categories,
        categoryScale,
        values,
        valueScale,
        styleClasses,
        keys,
        valueDomain,
        labels: { labels: labels },
      } = chartWindowD;
      const chartWindowS = select<HTMLDivElement, ChartWindowBar>(g[i]),
        menuItemsS = chartWindowS.selectAll('.menu-tools > .items'),
        layouterS = chartWindowS.selectAll<HTMLDivElement, any>('.layouter');

      // category filter
      const categoryFilterS = menuItemsS
        .selectAll<HTMLLIElement, ToolFilterNominal>('.tool-filter-categories')
        .data([
          toolFilterNominalData({
            text: chartWindowD.categoryEntity,
            options: chartWindowD.categories,
            keys: chartWindowD.categories,
          }),
        ])
        .join('li')
        .classed('tool-filter-categories', true)
        .call((s) => toolFilterNominalRender(s))
        .call((s) =>
          s.selectAll('.checkbox input').attr('checked', (d, i) => categoryActiveStates[i])
        )
        .on('change.chartwindowbar', function (e, filterD) {
          const categoryFilterS = select(this);
          const checkedStates: boolean[] = [];
          const checkboxS = categoryFilterS
            .selectAll<Element, Checkbox>('.checkbox')
            .each((d, i, g) => checkedStates.push(g[i].querySelector('input')!.checked));
          chartWindowS.dispatch('categoryfilter', {
            detail: { categoryActiveStates: checkedStates },
          });
        });

      // download svg
      menuItemsS
        .selectAll<HTMLLIElement, any>('.tool-download-svg')
        .data([null])
        .join('li')
        .call((s) => toolDownloadSVGRender(s));

      const filterCat = (v: any, i: number) => categoryActiveStates[i];

      const filteredCategories = categories.filter(filterCat);
      const filteredValues = values.filter(filterCat);
      const filteredStyleClasses = arrayIs(styleClasses)
        ? styleClasses.filter(filterCat)
        : styleClasses;
      const filteredKeys = keys?.filter(filterCat);
      const filteredLabels = arrayIs(labels) ? labels.filter(filterCat) : labels;
      const filteredValueDomain =
        valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

      categoryScale.domain(filteredCategories);
      valueScale.domain(filteredValueDomain);

      // chart
      const chartS = layouterS
        .selectAll<SVGSVGElement, ChartBar>('svg.chart-bar')
        .data([
          chartBarData({
            ...chartWindowD,
            categories: filteredCategories,
            values: filteredValues,
            keys: filteredKeys,
            styleClasses: filteredStyleClasses,
            labels: { ...chartWindowD.labels, labels: filteredLabels },
          }),
        ])
        .join('svg')
        .call((s) => chartBar(s));

      layouterS
        .on('boundschange.chartwindowbar', () => chartBar(chartS))
        .call((s) => layouterCompute(s));
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

export function chartWindowBarAutoFilterCategories(selection: ChartWindowBarSelection): void {
  selection.on('categoryfilter.chartwindowbar', function (e, d) {
    d.categoryActiveStates = e.detail.categoryActiveStates;
    select<HTMLDivElement, ChartWindowBar>(this).call((s) => chartWindowBar(s));
  });
}
