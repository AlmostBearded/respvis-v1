import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { axisBottom, axisLeft, ConfigureAxisFn, Axis, axisData } from '../axis';
import { chart } from './chart';
import { debug, nodeToString } from './log';
import { ScaleAny } from './scale';

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
      const s = <ChartCartesianSelection>(
        select(g[i]).layout('display', 'flex').layout('padding', '20px')
      );

      const container = s
        .append('g')
        .classed('chart-container', true)
        .layout('flex', 1)
        .layout('display', 'grid')
        .layout('grid-template', '1fr auto / auto 1fr');

      container
        .append('svg')
        .classed('draw-area', true)
        .attr('overflow', 'visible')
        .layout('grid-area', '1 / 2')
        .layout('display', 'grid');

      container
        .append('g')
        .datum(axisData(d.yAxis))
        .call((s) => axisLeft(s))
        .layout('grid-area', '1 / 1');

      container
        .append('g')
        .datum(axisData(d.xAxis))
        .call((s) => axisBottom(s))
        .layout('grid-area', '2 / 2');
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
  selection.each(function (chartData, i, g) {
    const s = <ChartCartesianSelection>select(g[i]);

    const axisConfig = (selection: Selection<Element, Axis>, x: boolean) =>
      selection
        .datum((d) => Object.assign(d, x ? chartData.xAxis : chartData.yAxis))
        .classed('axis-x', x)
        .classed('axis-y', !x);

    if (chartData.flipped) {
      s.selectAll<SVGGElement, Axis>('.axis-left').call((s) => axisConfig(s, true));
      s.selectAll<SVGGElement, Axis>('.axis-bottom').call((s) => axisConfig(s, false));
    } else {
      s.selectAll<SVGGElement, Axis>('.axis-left').call((s) => axisConfig(s, false));
      s.selectAll<SVGGElement, Axis>('.axis-bottom').call((s) => axisConfig(s, true));
    }
  });
}
