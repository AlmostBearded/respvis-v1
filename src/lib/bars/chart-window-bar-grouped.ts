import { max } from 'd3-array';
import { select, Selection } from 'd3-selection';
import {
  chartWindow,
  ToolFilterNominal,
  toolFilterNominalData,
  toolDownloadSVG,
  toolFilterNominal,
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
      const chartWindow = select<HTMLDivElement, ChartWindowBarGrouped>(g[i]),
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

      chartWindow.on('change.chartwindowbargrouped', function () {
        chartWindowBarGroupedApplyFilters(select<Element, ChartWindowBarGrouped>(this));
      });

      // chart
      const chart = layouter
        .append('svg')
        .datum(chartBarGroupedData(chartWindowD))
        .call((s) => chartBarGrouped(s));

      chartWindow.on('datachange.chartwindowbargrouped', function (e, chartWindowD) {
        const chartWindowS = select<Element, ChartWindowBarGrouped>(this);

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

        chartWindowBarGroupedApplyFilters(chartWindowS);
      });
    });
}

export function chartWindowBarGroupedApplyFilters(
  selection: Selection<Element, ChartWindowBarGrouped>
): void {
  selection.each((chartWindowD, i, g) => {
    const {
      categories,
      subcategories,
      styleClasses,
      values,
      keys,
      valueDomain,
      labels: { labels: labels },
    } = chartWindowD;
    const chartWindowS = select<Element, ChartWindowBarGrouped>(g[i]);
    const chartS = chartWindowS.selectAll<Element, ChartBarGrouped>('svg.chart-bar-grouped');
    const catFilterS = chartWindowS.selectAll('.tool-filter-categories');
    const subcatFilterS = chartWindowS.selectAll('.tool-filter-subcategories');
    const filterCat = (v: any, i: number) =>
      catFilterS.selectAll(`.checkbox[data-key="${categories[i]}"] input`).property('checked');
    const filterSubcat = (v: any, i: number) =>
      subcatFilterS
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

    chartS.datum(
      (d) => (
        d.categoryScale.domain(filteredCats),
        d.valueScale.domain(filteredValueDomain).nice(),
        Object.assign<ChartBarGrouped, ChartBarGrouped, Partial<ChartBarGrouped>>(
          d,
          chartBarGroupedData(chartWindowD),
          {
            categories: filteredCats,
            subcategories: filteredSubcats,
            values: filteredValues,
            keys: filteredKeys,
            styleClasses: filteredStyleClasses,
            legend: {
              ...chartWindowD.legend,
            },
            labels: {
              ...chartWindowD.labels,
              labels: filteredLabels,
            },
          }
        )
      )
    );
  });
}
