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
import {
  dataPointsCreation,
  DataPointsCreation,
  DataSeriesPoint,
  dataSeriesPoint,
  seriesPoint,
} from './series-point';

export interface DataChartPoint extends DataPointsCreation {
  configureMainAxis: ConfigureAxisFn;
  mainTitle: string;
  configureCrossAxis: ConfigureAxisFn;
  crossTitle: string;
}

export function dataChartPoint(data?: Partial<DataChartPoint>): DataChartPoint {
  return {
    ...dataPointsCreation(data),
    configureMainAxis: data?.configureMainAxis || (() => {}),
    mainTitle: data?.mainTitle || '',
    configureCrossAxis: data?.configureCrossAxis || (() => {}),
    crossTitle: data?.crossTitle || '',
  };
}

export function chartPoint<Datum extends DataChartPoint, PElement extends BaseType, PDatum>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return chart(selection)
    .classed('chart-point', true)
    .each((d, i, g) => {
      const s = select<SVGSVGElement, Datum>(g[i])
        .layout('display', 'grid')
        .layout('grid-template', '1fr auto / auto 1fr')
        .layout('padding', '20px');

      const drawArea = s
        .append('svg')
        .classed('draw-area', true)
        .layout('grid-area', '1 / 2')
        .layout('display', 'grid');

      drawArea
        .append('rect')
        .classed('background', true)
        .layout('grid-area', '1 / 1')
        .attr('opacity', 0);

      drawArea
        .append('g')
        .layout('grid-area', '1 / 1')
        .datum((d) => dataSeriesPoint(d))
        .call((s) => seriesPoint(s));

      s.append('g')
        .layout('grid-area', '1 / 1')
        .datum((d) => dataAxis())
        .call((s) => axisLeft(s));

      s.append('g')
        .layout('grid-area', '2 / 2')
        .datum((d) => dataAxis())
        .call((s) => axisBottom(s));
    })
    .on('datachange.chartpoint', function (e, chartData) {
      debug(`data change on ${nodeToString(this)}`);
      chartPointDataChange(select<SVGSVGElement, Datum>(this));
    })
    .call((s) => chartPointDataChange(s));
}

export function chartPointDataChange<
  Datum extends DataChartPoint,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<SVGSVGElement, Datum, PElement, PDatum>
): Selection<SVGSVGElement, Datum, PElement, PDatum> {
  return selection.each(function (chartData, i, g) {
    const s = select<SVGSVGElement, Datum>(g[i]);

    s.selectAll<SVGElement, DataSeriesPoint>('.series-point').datum((d) =>
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

    s.selectAll<SVGGElement, DataAxis>('.axis-left').call((s) => axisConfig(s, false));
    s.selectAll<SVGGElement, DataAxis>('.axis-bottom').call((s) => axisConfig(s, true));
  });
}
