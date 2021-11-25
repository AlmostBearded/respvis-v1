import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, Axis, axisData } from './axis';
import { chart } from './chart';
import { debug, nodeToString } from './utility/log';

export interface ChartCartesian {
  xAxis: Axis;
  yAxis: Axis;
  flipped: boolean;
}

export function chartCartesianData(
  data: Omit<Partial<ChartCartesian>, 'xAxis' | 'yAxis'> & {
    xAxis?: Partial<Axis>;
    yAxis?: Partial<Axis>;
  }
): ChartCartesian {
  return {
    xAxis: axisData(data.xAxis || {}),
    yAxis: axisData(data.yAxis || axisData({})),
    flipped: data.flipped || false,
  };
}

export type ChartCartesianSelection = Selection<SVGSVGElement | SVGGElement, ChartCartesian>;

export function chartCartesian(selection: ChartCartesianSelection, autoUpdateAxes: boolean): void {
  selection
    .call((s) => chart(s))
    .classed('chart-cartesian', true)
    .each((d, i, g) => {
      const s = <ChartCartesianSelection>select(g[i]);

      const drawAreaS = s.append('svg').classed('draw-area', true);

      drawAreaS.append('rect').classed('background', true);

      s.append('g')
        .datum(axisData(d.yAxis))
        .call((s) => axisLeft(s));

      s.append('g')
        .datum(axisData(d.xAxis))
        .call((s) => axisBottom(s));
    })
    .call(
      (s) =>
        autoUpdateAxes &&
        s
          .on('datachange.debuglog', function () {
            debug(`data change on ${nodeToString(this)}`);
          })
          .on('datachange.updateaxes', function (e, chartData) {
            chartCartesianUpdateAxes(<ChartCartesianSelection>select(this));
          })
    )
    .call((s) => chartCartesianUpdateAxes(s));
}

export function chartCartesianUpdateAxes(selection: ChartCartesianSelection): void {
  selection.each(function ({ flipped, xAxis, yAxis }, i, g) {
    const s = <ChartCartesianSelection>select(g[i]);

    s.selectAll<SVGGElement, Axis>('.axis-left')
      .datum((d) => Object.assign(d, flipped ? xAxis : yAxis))
      .classed('axis-x', flipped)
      .classed('axis-y', !flipped);

    s.selectAll<SVGGElement, Axis>('.axis-bottom')
      .datum((d) => Object.assign(d, flipped ? yAxis : xAxis))
      .classed('axis-x', !flipped)
      .classed('axis-y', flipped);
  });
}
