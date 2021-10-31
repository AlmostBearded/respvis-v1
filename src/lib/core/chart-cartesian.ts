import { select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, Axis } from '../axis';
import { chart } from './chart';
import { debug, nodeToString } from './log';
import { DataHydrateFn } from './utility/data';

export interface ChartCartesian {
  xAxis: Partial<Axis>;
  yAxis: Partial<Axis>;
  flipped: boolean;
}

export function chartCartesianDataHydrate(data: Partial<ChartCartesian>): ChartCartesian {
  return {
    xAxis: data.xAxis || {},
    yAxis: data.yAxis || {},
    flipped: data.flipped || false,
  };
}

export type ChartSelection<Data> = Selection<SVGSVGElement | SVGGElement, Partial<Data>>;
export type ChartCartesianSelection = ChartSelection<ChartCartesian>;

export function chartCartesian(selection: ChartSelection<ChartCartesian>): void {
  selection
    .call((s) => chart(s))
    .classed('chart-cartesian', true)
    .each(function (d) {
      debug(`render cartesian chart on ${nodeToString(this)}`);
      const chartS = <ChartCartesianSelection>select(this);

      chartS
        .selectAll('.draw-area')
        .data([null])
        .join('svg')
        .classed('draw-area', true)
        .selectAll('.background')
        .data([null])
        .join('rect')
        .classed('background', true);
    });
}

export function chartCartesianAxes(
  selection: ChartCartesianSelection,
  dataHydrate: DataHydrateFn<ChartCartesian> = chartCartesianDataHydrate
): void {
  selection.each(function (d) {
    debug(`render cartesian chart axes on ${nodeToString(this)}`);
    const chartS = <ChartCartesianSelection>select(this);
    const { xAxis, yAxis, flipped } = dataHydrate(d);

    chartS
      .selectAll<SVGGElement, Axis>('.axis-bottom')
      .data([!flipped ? xAxis : yAxis])
      .join('g')
      .classed('axis-x', !flipped)
      .classed('axis-y', flipped)
      .call((s) => axisBottom(s));

    chartS
      .selectAll<SVGGElement, Axis>('.axis-left')
      .data([!flipped ? yAxis : xAxis])
      .join('g')
      .classed('axis-x', flipped)
      .classed('axis-y', !flipped)
      .call((s) => axisLeft(s));
  });
}
