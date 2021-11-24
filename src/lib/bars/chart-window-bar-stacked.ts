import { select, selectAll, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
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
      const chartWindow = select<HTMLDivElement, ChartWindowBarStacked>(g[i]),
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
            keys: chartWindowD.categories,
          })
        )
        .call(toolFilterNominal);

      // subcategory filter
      menuItems
        .append('li')
        .classed('tool-filter-subcategories', true)
        .datum(
          toolFilterNominalData({
            text: chartWindowD.subcategoryEntity,
            options: chartWindowD.subcategories,
            keys: chartWindowD.subcategories,
          })
        )
        .call(toolFilterNominal);

      // download svg
      menuItems.append('li').call((s) => toolDownloadSVG(s));

      chartWindow.on('change.chartwindowbarstacked', function () {
        chartWindowBarStackedApplyFilters(select<Element, ChartWindowBarStacked>(this));
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(chartBarStackedData(chartWindowD))
        .call((s) => chartBarStacked(s));

      chartWindow.on('datachange.chartwindowbarstacked', function (e, chartWindowD) {
        const chartWindowS = select<Element, ChartWindowBarStacked>(this);

        chartWindowS.selectAll<Element, ToolFilterNominal>('.tool-filter-categories').datum({
          text: chartWindowD.categoryEntity,
          options: chartWindowD.categories,
          keys: chartWindowD.categories,
        });

        chartWindowS.selectAll<Element, ToolFilterNominal>('.tool-filter-subcategories').datum({
          text: chartWindowD.subcategoryEntity,
          options: chartWindowD.subcategories,
          keys: chartWindowD.subcategories,
        });

        chartWindowBarStackedApplyFilters(chartWindowS);
      });
    });
}

export function chartWindowBarStackedApplyFilters(
  selection: Selection<Element, ChartWindowBarStacked>
): void {
  selection.each((chartWindowD, i, g) => {
    const {
      categories,
      subcategories,
      values,
      keys,
      valueDomain,
      valuesAsRatios,
      labels: { labels: labels },
    } = chartWindowD;
    const chartWindowS = select<Element, ChartWindowBarStacked>(g[i]);
    const chartS = chartWindowS.selectAll<Element, ChartBarStacked>('svg.chart-bar-stacked');
    const catFilterS = chartWindowS.selectAll<Element, ToolFilterNominal>(
      '.tool-filter-categories'
    );
    const subcatFilterS = chartWindowS.selectAll<Element, ToolFilterNominal>(
      '.tool-filter-subcategories'
    );
    const filterCat = (v: any, i: number) =>
      catFilterS.selectAll(`.checkbox[data-key="${categories[i]}"] input`).property('checked');
    const filterSubcat = (v: any, i: number) =>
      subcatFilterS
        .selectAll(`.checkbox[data-key="${subcategories[i]}"] input`)
        .property('checked');

    const filteredCats = categories.filter(filterCat);
    const filteredCatIndices = categories.map((c, i) => i).filter(filterCat);
    const filteredSubcats = subcategories.filter(filterSubcat);
    const filteredSubcatIndices = subcategories.map((c, i) => i).filter(filterSubcat);
    const filteredValues = values
      .filter(filterCat)
      .map((catValues) => catValues.filter(filterSubcat))
      .map((catValues) => {
        if (!valuesAsRatios) return catValues;
        const sum = catValues.reduce((prev, curr) => prev + curr, 0);
        return catValues.map((v) => (v / sum) * 100 || 0);
      });
    const filteredKeys = keys?.filter(filterCat).map((v) => v.filter(filterSubcat));
    const filteredLabels =
      arrayIs(labels) &&
      arrayFlat(
        arrayPartition(labels, subcategories.length)
          .filter(filterCat)
          .map((v) => v.filter(filterSubcat))
      );
    const filteredValueDomain =
      valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

    chartS.datum(
      (d) => (
        d.categoryScale.domain(filteredCats),
        d.valueScale.domain(filteredValueDomain).nice(),
        Object.assign(d, chartBarStackedData(chartWindowD), {
          categories: filteredCats,
          subcategories: filteredSubcats,
          values: filteredValues,
          keys: filteredKeys,
          categoryIndices: filteredCatIndices,
          subcategoryIndices: filteredSubcatIndices,
          legend: {
            ...chartWindowD.legend,
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
