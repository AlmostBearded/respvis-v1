import { select, Selection } from 'd3-selection';
import {
  chartWindowRender,
  ToolFilterNominal,
  ToolFilterNominalActiveEvent,
  toolFilterNominalData,
  toolDownloadSVG,
  chartWindowAddDownloadSVGTool,
  toolFilterNominalRender,
} from '../chart-window';
import { arrayIs, layouterCompute, resizeEventListener } from '../core';
import { DataHydrateFn } from '../core/utility/data';
import { chartBar, chartBarData, ChartBar } from './chart-bar';

export interface ChartWindowBar extends ChartBar {
  categoryEntity: string;
  valueEntity: string;
  activeCategories: boolean[];
}

export function chartWindowBarDataHydrate(data: Partial<ChartWindowBar>): ChartWindowBar {
  const chartData = chartBarData(data);
  return {
    ...chartData,
    activeCategories: data.activeCategories || chartData.categories.map((c) => true),
    categoryEntity: data.categoryEntity || 'Categories',
    valueEntity: data.valueEntity || 'Values',
  };
}

export type ChartWindowBarSelection = Selection<HTMLDivElement, Partial<ChartWindowBar>>;

export function chartWindowBar(
  selection: ChartWindowBarSelection,
  dataHydrate: DataHydrateFn<ChartWindowBar> = chartWindowBarDataHydrate
): void {
  selection
    .classed('chart-window-bar', true)
    .call((s) => chartWindowRender(s))
    .each(function (chartWindowD) {
      const { categories, values, labels, activeCategories, categoryEntity } =
        dataHydrate(chartWindowD);
      const chartWindowS = select<HTMLDivElement, ChartWindowBar>(this);
      const menuItems = chartWindowS.selectAll('.menu-tools .items');
      const layouter = chartWindowS.selectAll<HTMLDivElement, unknown>('.layouter');

      // category filter
      menuItems
        .selectAll<HTMLLIElement, ToolFilterNominal>('.tool-filter-categories')
        .data([
          {
            text: categoryEntity,
            options: categories,
            active: activeCategories,
          },
        ])
        .join('li')
        .classed('tool-filter-categories', true)
        .call((s) => toolFilterNominalRender(s))
        .on(
          'active.chartwindowbar',
          function ({
            detail: { active, changedIndex, changedValue },
          }: ToolFilterNominalActiveEvent) {
            chartWindowS.dispatch('categoryfilter', {
              detail: { activeCategories: active, changedIndex, changedValue },
            });
          }
        );

      chartWindowAddDownloadSVGTool(chartWindowS);

      // chart
      const filterCategories = (_: any, categoryIndex: number) => activeCategories[categoryIndex];
      const filteredCategories = categories.filter(filterCategories);
      const filteredValues = values.filter(filterCategories);
      const filteredLabels =
        (arrayIs(labels.labels) && labels.labels.filter(filterCategories)) || labels.labels;

      const barChartS = layouter
        .selectAll<SVGSVGElement, ChartBar>('.chart-bar')
        .data([
          dataHydrate({
            ...chartWindowD,
            categories: filteredCategories,
            values: filteredValues,
            labels: { ...labels, labels: filteredLabels },
          }),
        ])
        .join('svg')
        .call((s) => chartBar(s));

      layouter
        .on('boundschange.chartwindowbar', () => chartBar(barChartS))
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

export function chartWindowBarDensity(selection: ChartWindowBarSelection): void {
  selection.each((d, i, g) => {
    const { width, height } = g[i].getBoundingClientRect();
    const { values } = select(g[i]).selectAll<Element, ChartBar>('.chart-bar').datum();
    select(g[i]).dispatch('densitychange', {
      detail: { density: { x: values.length / width, y: values.length / height } },
    });
  });
}
