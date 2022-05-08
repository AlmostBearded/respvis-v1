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
import { chartBarStackedRender, chartBarStackedData, ChartBarStacked } from './chart-bar-stacked';

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
    valuesAsRatios = data.valuesAsRatios || false,
    valueDomain =
      data.valueDomain ||
      ((values) =>
        valuesAsRatios
          ? [0, 100]
          : [0, Math.max(...values.map((catV) => catV.reduce((a, b) => a + b))) * 1.05]);

  chartData.valueScale.domain(
    valueDomain instanceof Function ? valueDomain(chartData.values) : valueDomain
  );

  return {
    ...chartData,
    categoryEntity: data.categoryEntity || 'Categories',
    subcategoryEntity: data.subcategoryEntity || 'Subcategories',
    valueEntity: data.valueEntity || 'Values',
    valueDomain: valueDomain,
    valuesAsRatios,
    categoryActiveStates: data.categoryActiveStates || chartData.categories.map(() => true),
    subcategoryActiveStates:
      data.subcategoryActiveStates || chartData.subcategories.map(() => true),
  };
}

export function chartWindowBarStackedRender(
  selection: Selection<HTMLDivElement, ChartWindowBarStacked>
): void {
  selection
    .classed('chart-window-bar-stacked', true)
    .call((s) => chartWindowRender(s))
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
        .call((s) => chartBarStackedRender(s));

      layouterS
        .on('boundschange.chartwindowbarstacked', () => chartBarStackedRender(chartS))
        .call((s) => layouterCompute(s));
    });
}

export function chartWindowBarStackedAutoResize(
  selection: Selection<HTMLDivElement, ChartWindowBarStacked>
): void {
  selection.on('resize', function () {
    select<HTMLDivElement, ChartWindowBarStacked>(this).call((s) => chartWindowBarStackedRender(s));
  });
}

export function chartWindowBarStackedAutoFilterCategories(
  data?: ChartWindowBarStacked
): (selection: Selection<HTMLDivElement, ChartWindowBarStacked>) => void {
  return (s) =>
    s.on('categoryfilter', function (e, d) {
      data = data || d;
      data.categoryActiveStates = e.detail.categoryActiveStates;
      select<HTMLDivElement, ChartWindowBarStacked>(this)
        .datum(chartWindowBarStackedData(data))
        .call((s) => chartWindowBarStackedRender(s));
    });
}

export function chartWindowBarStackedAutoFilterSubcategories(
  data?: ChartWindowBarStacked
): (selection: Selection<HTMLDivElement, ChartWindowBarStacked>) => void {
  return (s) =>
    s.on('subcategoryfilter', function (e, d) {
      data = data || d;
      data.subcategoryActiveStates = e.detail.subcategoryActiveStates;
      select<HTMLDivElement, ChartWindowBarStacked>(this)
        .datum(chartWindowBarStackedData(data))
        .call((s) => chartWindowBarStackedRender(s));
    });
}
