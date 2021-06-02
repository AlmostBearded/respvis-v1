import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, DataAxis, dataAxis } from '../axis';
import {
  chart,
  debug,
  nodeToString,
  textHorizontalAttrs,
  textTitleAttrs,
  textVerticalAttrs,
} from '../core';
import { Orientation, seriesBar } from './series-bar';
import {
  dataBarsGroupedCreation,
  DataBarsGroupedCreation,
  DataSeriesBarGrouped,
  dataSeriesBarGrouped,
  seriesBarGrouped,
} from './series-bar-grouped';
import { seriesLabel } from './series-label';
import { dataLabelsBarCreation, dataSeriesLabelBar } from './series-label-bar';

export interface DataChartBarGrouped extends DataBarsGroupedCreation {
  configureMainAxis: ConfigureAxisFn;
  mainTitle: string;
  configureCrossAxis: ConfigureAxisFn;
  crossTitle: string;
}

export function dataChartBarGrouped(data?: Partial<DataChartBarGrouped>): DataChartBarGrouped {
  return {
    ...dataBarsGroupedCreation(data),
    configureMainAxis: data?.configureMainAxis || (() => {}),
    mainTitle: data?.mainTitle || '',
    configureCrossAxis: data?.configureCrossAxis || (() => {}),
    crossTitle: data?.crossTitle || '',
  };
}

export function chartBarGrouped<
  Datum extends DataChartBarGrouped,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return chart(selection)
    .classed('chart-bar-grouped', true)
    .each((d, i, g) => {
      const s = select<SVGSVGElement, Datum>(g[i])
        .layout('display', 'grid')
        .layout('grid-template', '1fr auto / auto 1fr')
        .layout('padding', '20px');

      const drawArea = s
        .append('svg')
        .classed('draw-area', true)
        .attr('overflow', 'visible')
        .layout('grid-area', '1 / 2 / 2 / 3')
        .layout('display', 'grid');

      const barSeries = drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum((d) => dataSeriesBarGrouped(d))
        .call((s) => seriesBarGrouped(s));

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum((d) => dataSeriesLabelBar(dataLabelsBarCreation({ barContainer: barSeries })))
        .call((s) => seriesLabel(s));

      s.append('g')
        .layout('grid-area', '1 / 1 / 2 / 2')
        .datum((d) => dataAxis())
        .call((s) => axisLeft(s));

      s.append('g')
        .layout('grid-area', '2 / 2 / 3 / 3')
        .datum((d) => dataAxis())
        .call((s) => axisBottom(s));
    })
    .on('datachange.chartbargrouped', function (e, chartData) {
      debug(`data change on ${nodeToString(this)}`);
      chartBarGroupedDataChange(select<SVGSVGElement, Datum>(this));
    })
    .call((s) => chartBarGroupedDataChange(s));
}

export function chartBarGroupedDataChange<
  Datum extends DataChartBarGrouped,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<SVGSVGElement, Datum>(g[i]);

    s.selectAll<SVGElement, DataSeriesBarGrouped>('.series-bar-grouped').datum((d) =>
      Object.assign(d, { creation: chartData })
    );

    const axisConfig = (selection: Selection<Element, DataAxis>, main: boolean) =>
      selection
        .datum((d) =>
          Object.assign(d, {
            scale: main ? chartData.mainScale : chartData.crossScale,
            title: main ? chartData.mainTitle : chartData.crossTitle,
            configureAxis: main ? chartData.configureMainAxis : chartData.configureCrossAxis,
          })
        )
        .classed('axis-main', main)
        .classed('axis-cross', !main);

    if (chartData.orientation === Orientation.Horizontal) {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, true));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, false));
    } else {
      s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, false));
      s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, true));
    }
  });
}
