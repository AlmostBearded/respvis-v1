import { select, selectAll, Selection } from 'd3';
import {
  chartWindowRender,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVGRender,
  toolFilterNominalRender,
  layouterCompute,
  Checkbox,
} from '../core';
import { arrayIs, arrayIs2D, arrayPartition } from '../core';
import { chartBarStacked, chartBarStackedData, ChartBarStacked } from './chart-bar-stacked';

export interface ChartWindowBarStacked extends ChartBarStacked {
  categoryActiveStates: boolean[];
  subcategoryActiveStates: boolean[];
  categoryEntity: string;
  subcategoryEntity: string;
  valueEntity: string;
  valueDomain: number[] | ((values: number[][]) => number[]);
  valuesAsRatios: boolean;
}

export function chartWindowBarStackedData(
  data: Partial<ChartWindowBarStacked>
): ChartWindowBarStacked {
  const chartData = chartBarStackedData(data),
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
    valuesAsRatios: data.valuesAsRatios || false,
    categoryActiveStates: data.categoryActiveStates || chartData.categories.map(() => true),
    subcategoryActiveStates:
      data.subcategoryActiveStates || chartData.subcategories.map(() => true),
  };
}

export function chartWindowBarStacked(
  selection: Selection<HTMLDivElement, ChartWindowBarStacked>
): void {
  selection
    .classed('chart-window-bar-stacked', true)
    .call((s) => chartWindowRender(s))
    .on('resize.chartwindowbar', function (e, d) {
      const s = select(this);
      const { width, height } = e.detail.bounds;
      const { values } = s.selectAll<Element, ChartBarStacked>('.chart-bar-stacked').datum();
      const dataCount = values.flat().length;
      s.dispatch('densitychange', {
        detail: { density: { x: dataCount / width, y: dataCount / height } },
      });
    })
    .each((chartWindowD, i, g) => {
      const {
        categories,
        categoryScale,
        subcategories,
        values,
        valueScale,
        keys,
        styleClasses,
        valueDomain,
        valuesAsRatios,
        categoryActiveStates,
        subcategoryActiveStates,
        labels: { labels: labels },
      } = chartWindowD;
      const chartWindowS = select<HTMLDivElement, ChartWindowBarStacked>(g[i]),
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
        .call(toolFilterNominalRender)
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
        .call(toolFilterNominalRender)
        .call((s) =>
          s.selectAll('.checkbox input').attr('checked', (d, i) => subcategoryActiveStates[i])
        )
        .on('change.chartwindowbar', function (e, filterD) {
          const subcategoryFilterS = select(this);
          const checkedStates: boolean[] = [];
          const checkboxS = subcategoryFilterS
            .selectAll<Element, Checkbox>('.checkbox')
            .each((d, i, g) => checkedStates.push(g[i].querySelector('input')!.checked));
          chartWindowS.dispatch('subcategoryfilter', {
            detail: { subcategoryActiveStates: checkedStates },
          });
        });

      // download svg
      menuItemsS
        .selectAll<HTMLLIElement, any>('.tool-download-svg')
        .data([null])
        .join('li')
        .call((s) => toolDownloadSVGRender(s));

      const filterCat = (v: any, i: number) => categoryActiveStates[i];
      const filterSubcat = (v: any, i: number) => subcategoryActiveStates[i];

      const filteredCats = categories.filter(filterCat);
      const filteredSubcats = subcategories.filter(filterSubcat);
      const filteredStyleClasses = styleClasses.filter(filterSubcat);
      const filteredValues = values
        .filter(filterCat)
        .map((catValues) => catValues.filter(filterSubcat))
        .map((catValues) => {
          if (!valuesAsRatios) return catValues;
          const sum = catValues.reduce((prev, curr) => prev + curr, 0);
          return catValues.map((v) => (v / sum) * 100 || 0);
        });
      const filteredKeys = keys?.filter(filterCat).map((v) => v.filter(filterSubcat));
      const filteredLabels = arrayIs(labels)
        ? arrayPartition(labels, subcategories.length)
            .filter(filterCat)
            .map((v) => v.filter(filterSubcat))
            .flat()
        : labels;
      const filteredValueDomain =
        valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

      categoryScale.domain(filteredCats);
      valueScale.domain(filteredValueDomain).nice();

      // chart
      const chartS = layouterS
        .selectAll<SVGSVGElement, ChartBarStacked>('svg.chart-bar-stacked')
        .data([
          chartBarStackedData({
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
        .call((s) => chartBarStacked(s));

      layouterS
        .on('boundschange.chartwindowbarstacked', () => chartBarStacked(chartS))
        .call((s) => layouterCompute(s));
    });
}

export function chartWindowBarStackedAutoFilterCategories(
  selection: Selection<HTMLDivElement, ChartWindowBarStacked>
): void {
  selection.on('categoryfilter.chartwindowbargrouped', function (e, d) {
    d.categoryActiveStates = e.detail.categoryActiveStates;
    select<HTMLDivElement, ChartWindowBarStacked>(this).call((s) => chartWindowBarStacked(s));
  });
}

export function chartWindowBarStackedAutoFilterSubcategories(
  selection: Selection<HTMLDivElement, ChartWindowBarStacked>
): void {
  selection.on('subcategoryfilter.chartwindowbargrouped', function (e, d) {
    d.subcategoryActiveStates = e.detail.subcategoryActiveStates;
    select<HTMLDivElement, ChartWindowBarStacked>(this).call((s) => chartWindowBarStacked(s));
  });
}
