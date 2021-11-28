import { select, selectAll, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
  layouterCompute,
} from '../core';
import { arrayFlat, arrayIs, arrayIs2D, arrayPartition } from '../core';
import { chartBarStacked, chartBarStackedData, ChartBarStacked } from './chart-bar-stacked';

export interface ChartWindowBarStacked extends ChartBarStacked {
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
  };
}

export function chartWindowBarStacked(
  selection: Selection<HTMLDivElement, ChartWindowBarStacked>
): void {
  selection
    .classed('chart-window-bar-stacked', true)
    .call((s) => chartWindow(s))
    .on('resize.chartwindowbar', function (e, d) {
      const s = select(this);
      const { width, height } = e.detail.size;
      const { values } = s.selectAll<Element, ChartBarStacked>('.chart-bar-stacked').datum();
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
        values,
        valueScale,
        keys,
        styleClasses,
        valueDomain,
        valuesAsRatios,
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
        .call(toolFilterNominal);

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
        .call(toolFilterNominal);

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
        ? arrayFlat(
            arrayPartition(labels, subcategories.length)
              .filter(filterCat)
              .map((v) => v.filter(filterSubcat))
          )
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

      chartWindowS.on('change.chartwindowbarstacked', function () {
        select<HTMLDivElement, ChartWindowBarStacked>(this).call((s) => chartWindowBarStacked(s));
      });
    });
}
