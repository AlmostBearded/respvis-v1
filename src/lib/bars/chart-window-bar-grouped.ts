import { max } from 'd3-array';
import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
  layouterCompute,
} from '../core';
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
    .on('resize.chartwindowbar', function (e, d) {
      const s = select(this);
      const { width, height } = e.detail.size;
      const { values } = s.selectAll<Element, ChartBarGrouped>('.chart-bar-grouped').datum();
      const dataCount = arrayFlat(values).length;
      s.dispatch('densitychange', {
        detail: { density: { x: dataCount / width, y: dataCount / height } },
      });
    })
    .each((chartWindowD, i, g) => {
      const {
        categories,
        categoryScale,
        subcategories,
        styleClasses,
        values,
        valueScale,
        keys,
        valueDomain,
        labels: { labels: labels },
      } = chartWindowD;
      const chartWindowS = select<HTMLDivElement, ChartWindowBarGrouped>(g[i]),
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
        .call((s) => toolFilterNominal(s));

      // subcategory filter
      const subcategoryFilterS = menuItemsS
        .selectAll<HTMLLIElement, ToolFilterNominal>('.tool-filter-subcategories')
        .data([
          toolFilterNominalData({
            text: chartWindowD.subcategoryEntity,
            options: chartWindowD.subcategories,
            keys: chartWindowD.subcategories,
          }),
        ])
        .join('li')
        .classed('tool-filter-subcategories', true)
        .call((s) => toolFilterNominal(s));

      // download svg
      menuItemsS
        .selectAll<HTMLLIElement, any>('.tool-save-svg')
        .data([null])
        .join('li')
        .call((s) => toolDownloadSVG(s));

      const filterCat = (v: any, i: number) =>
        categoryFilterS
          .selectAll(`.checkbox[data-key="${categories[i]}"] input`)
          .property('checked');
      const filterSubcat = (v: any, i: number) =>
        subcategoryFilterS
          .selectAll(`.checkbox[data-key="${subcategories[i]}"] input`)
          .property('checked');

      const filteredCats = categories.filter(filterCat),
        filteredSubcats = subcategories.filter(filterSubcat),
        filteredStyleClasses = styleClasses.filter(filterSubcat),
        filteredValues = values.filter(filterCat).map((v) => v.filter(filterSubcat)),
        filteredKeys = keys?.filter(filterCat).map((v) => v.filter(filterSubcat)),
        filteredLabels = arrayIs(labels)
          ? arrayFlat(
              arrayPartition(labels, subcategories.length)
                .filter(filterCat)
                .map((v) => v.filter(filterSubcat))
            )
          : labels,
        filteredValueDomain =
          valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

      categoryScale.domain(filteredCats);
      valueScale.domain(filteredValueDomain).nice();

      // chart
      const chartS = layouterS
        .selectAll<SVGSVGElement, ChartBarGrouped>('svg.chart-bar-grouped')
        .data([
          chartBarGroupedData({
            ...chartWindowD,
            categories: filteredCats,
            subcategories: filteredSubcats,
            values: filteredValues,
            keys: filteredKeys,
            styleClasses: filteredStyleClasses,
            labels: { ...chartWindowD.labels, labels: filteredLabels },
          }),
        ])
        .join('svg')
        .call((s) => chartBarGrouped(s));

      layouterS
        .on('boundschange.chartwindowbargrouped', () => chartBarGrouped(chartS))
        .call((s) => layouterCompute(s));

      chartWindowS.on('change.chartwindowbargrouped', function () {
        select<HTMLDivElement, ChartWindowBarGrouped>(this).call((s) => chartWindowBarGrouped(s));
      });
    });
}
