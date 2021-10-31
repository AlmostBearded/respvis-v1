// import { select, selectAll, Selection } from 'd3-selection';
// import {
//   chartWindow,
//   ToolFilterNominal,
//   toolFilterNominalDataHydrate,
//   toolDownloadSVG,
//   toolFilterNominal,
// } from '../chart-window';
// import { arrayFlat, arrayIs, arrayIs2D, arrayPartition } from '../core';
// import { chartBarStacked, chartBarStackedData, ChartBarStacked } from './chart-bar-stacked';

// export interface ChartWindowBarStacked extends ChartBarStacked {
//   categoryEntity: string;
//   subcategoryEntity: string;
//   valueEntity: string;
//   valueDomain: number[] | ((values: number[][]) => number[]);
//   valuesAsRatios: boolean;
// }

// export function chartWindowBarStackedData(
//   data: Partial<ChartWindowBarStacked>
// ): ChartWindowBarStacked {
//   const chartData = chartBarStackedData(data),
//     valueDomain =
//       data.valueDomain ||
//       ((values) => [0, Math.max(...values.map((catV) => Math.max(...catV))) * 1.05]);

//   chartData.valueScale.domain(
//     valueDomain instanceof Function ? valueDomain(chartData.values) : valueDomain
//   );

//   return {
//     ...chartData,
//     categoryEntity: data.categoryEntity || 'Categories',
//     subcategoryEntity: data.subcategoryEntity || 'Subcategories',
//     valueEntity: data.valueEntity || 'Values',
//     valueDomain: valueDomain,
//     valuesAsRatios: data.valuesAsRatios || false,
//   };
// }

// export function chartWindowBarStacked(
//   selection: Selection<HTMLDivElement, ChartWindowBarStacked>
// ): void {
//   selection
//     .classed('chart-window-bar-stacked', true)
//     .call((s) => chartWindow(s))
//     .on('resize.chartwindowbar', function (e, d) {
//       const s = select(this);
//       const { width, height } = e.detail.size;
//       const { values } = s.selectAll<Element, ChartBarStacked>('.chart-bar-stacked').datum();
//       const dataCount = arrayFlat(values).length;
//       s.dispatch('densitychange', {
//         detail: { density: { x: dataCount / width, y: dataCount / height } },
//       });
//     })
//     .each((chartWindowD, i, g) => {
//       const chartWindow = select<HTMLDivElement, ChartWindowBarStacked>(g[i]),
//         menuItems = chartWindow.selectAll('.menu-tools .items'),
//         layouter = chartWindow.selectAll('.layouter');

//       // category filter
//       menuItems
//         .append('li')
//         .classed('tool-filter-categories', true)
//         .datum(
//           toolFilterNominalDataHydrate({
//             text: chartWindowD.categoryEntity,
//             options: chartWindowD.categories,
//           })
//         )
//         .call(toolFilterNominal);

//       // subcategory filter
//       menuItems
//         .append('li')
//         .classed('tool-filter-subcategories', true)
//         .datum(
//           toolFilterNominalDataHydrate({
//             text: chartWindowD.subcategoryEntity,
//             options: chartWindowD.subcategories,
//           })
//         )
//         .call(toolFilterNominal);

//       // download svg
//       menuItems.append('li').call((s) => toolDownloadSVG(s));

//       chartWindow.on('change.chartwindowbarstacked', function () {
//         chartWindowBarStackedApplyFilters(select<Element, ChartWindowBarStacked>(this));
//       });

//       // chart
//       const chart = layouter
//         .append('svg')
//         .datum(chartBarStackedData(chartWindowD))
//         .call((s) => chartBarStacked(s));

//       chartWindow.on('datachange.chartwindowbarstacked', function (e, chartWindowD) {
//         const chartWindowS = select<Element, ChartWindowBarStacked>(this),
//           categoryFilterS = chartWindowS.selectAll<Element, ToolFilterNominal>(
//             '.tool-filter-categories'
//           ),
//           categoryFilterD = categoryFilterS.datum(),
//           subcategoryFilterS = chartWindowS.selectAll<Element, ToolFilterNominal>(
//             '.tool-filter-subcategories'
//           ),
//           subcategoryFilterD = subcategoryFilterS.datum(),
//           filterOptionMap = (data: ToolFilterNominal) =>
//             data.options.reduce<Record<string, boolean>>(
//               (obj, option, i) => Object.assign(obj, { [`${option}`]: data.active[i] }),
//               {}
//             ),
//           categoryOptionMap = filterOptionMap(categoryFilterD),
//           subcategoryOptionMap = filterOptionMap(subcategoryFilterD),
//           filterDatum = (text: string, options: string[], optionMap: Record<string, boolean>) => ({
//             text: text,
//             options: options,
//             shown: options.map((o) => (optionMap[o] === undefined ? true : optionMap[o])),
//           });

//         categoryFilterS.datum((d) =>
//           Object.assign(
//             d,
//             filterDatum(chartWindowD.categoryEntity, chartWindowD.categories, categoryOptionMap)
//           )
//         );

//         subcategoryFilterS.datum((d) =>
//           Object.assign(
//             d,
//             filterDatum(
//               chartWindowD.subcategoryEntity,
//               chartWindowD.subcategories,
//               subcategoryOptionMap
//             )
//           )
//         );

//         chartWindowBarStackedApplyFilters(chartWindowS);
//       });
//     });
// }

// export function chartWindowBarStackedApplyFilters(
//   selection: Selection<Element, ChartWindowBarStacked>
// ): void {
//   selection.each((chartWindowD, i, g) => {
//     const {
//         categories,
//         subcategories,
//         values,
//         keys,
//         valueDomain,
//         valuesAsRatios,
//         labels: { labels: labels },
//       } = chartWindowD,
//       chartWindowS = select<Element, ChartWindowBarStacked>(g[i]),
//       chartS = chartWindowS.selectAll<Element, ChartBarStacked>('svg.chart-bar-stacked'),
//       catFilterD = chartWindowS
//         .selectAll<Element, ToolFilterNominal>('.tool-filter-categories')
//         .datum(),
//       subcatFilterD = chartWindowS
//         .selectAll<Element, ToolFilterNominal>('.tool-filter-subcategories')
//         .datum(),
//       filterCat = (_, i: number) => catFilterD.active[i],
//       filterSubcat = (_, i: number) => subcatFilterD.active[i];

//     const filteredCats = categories.filter(filterCat),
//       filteredCatIndices = categories.map((c, i) => i).filter(filterCat),
//       filteredSubcats = subcategories.filter(filterSubcat),
//       filteredSubcatIndices = subcategories.map((c, i) => i).filter(filterSubcat),
//       filteredValues = values
//         .filter(filterCat)
//         .map((catValues) => catValues.filter(filterSubcat))
//         .map((catValues) => {
//           if (!valuesAsRatios) return catValues;
//           const sum = catValues.reduce((prev, curr) => prev + curr, 0);
//           return catValues.map((v) => (v / sum) * 100 || 0);
//         }),
//       filteredKeys = keys?.filter(filterCat).map((v) => v.filter(filterSubcat)),
//       filteredLabels =
//         arrayIs(labels) &&
//         arrayFlat(
//           arrayPartition(labels, subcategories.length)
//             .filter(filterCat)
//             .map((v) => v.filter(filterSubcat))
//         ),
//       filteredValueDomain =
//         valueDomain instanceof Function ? valueDomain(filteredValues) : valueDomain;

//     chartS.datum(
//       (d) => (
//         d.categoryScale.domain(filteredCats),
//         d.valueScale.domain(filteredValueDomain).nice(),
//         Object.assign(d, chartBarStackedData(chartWindowD), {
//           categories: filteredCats,
//           subcategories: filteredSubcats,
//           values: filteredValues,
//           keys: filteredKeys,
//           categoryIndices: filteredCatIndices,
//           subcategoryIndices: filteredSubcatIndices,
//           legend: {
//             ...chartWindowD.legend,
//           },
//           labels: {
//             ...chartWindowD.labels,
//             ...(filteredLabels && { labels: filteredLabels }),
//           },
//         })
//       )
//     );
//   });
// }
