import { select, Selection } from 'd3';
import { axisBottomRender, axisLeftRender, Axis, axisData } from './axis';
import { chartRender } from './chart';

export interface ChartCartesian {
  title: string;
  subtitle: string;
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
    title: data.title || '',
    subtitle: data.subtitle || '',
    xAxis: axisData(data.xAxis || {}),
    yAxis: axisData(data.yAxis || {}),
    flipped: data.flipped || false,
  };
}

export type ChartCartesianSelection = Selection<SVGSVGElement | SVGGElement, ChartCartesian>;

export function chartCartesianRender(selection: ChartCartesianSelection): void {
  selection
    .call((s) => chartRender(s))
    .classed('chart-cartesian', true)
    .selectAll('.draw-area')
    .data([null])
    .join('svg')
    .classed('draw-area', true)
    .selectAll('.background')
    .data([null])
    .join('rect')
    .classed('background', true);

  const header = selection
    .selectAll('.header')
    .data((d) => [d])
    .join('g')
    .classed('header', true);

  header
    .selectAll('.title')
    .data((d) => [d.title])
    .join('g')
    .classed('title', true)
    .attr('data-ignore-layout-children', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => d);

  header
    .selectAll('.subtitle')
    .data((d) => [d.subtitle])
    .join('g')
    .classed('subtitle', true)
    .attr('data-ignore-layout-children', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => d);
}

export function chartCartesianAxesRender(selection: ChartCartesianSelection): void {
  selection
    .each(function ({ flipped, xAxis, yAxis }, i, g) {
      const s = <ChartCartesianSelection>select(g[i]);

      s.selectAll<SVGGElement, Axis>('.axis-left')
        .data([flipped ? xAxis : yAxis])
        .join('g')
        .call((s) => axisLeftRender(s))
        .classed('axis-x', flipped)
        .classed('axis-y', !flipped);

      s.selectAll<SVGGElement, Axis>('.axis-bottom')
        .data([flipped ? yAxis : xAxis])
        .join('g')
        .call((s) => axisBottomRender(s))
        .classed('axis-x', !flipped)
        .classed('axis-y', flipped);
    })
    .attr('data-flipped', (d) => d.flipped);
}

export enum LegendPosition {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

export function chartLegendPosition(
  chartSelection: Selection<SVGSVGElement | SVGGElement>,
  position: LegendPosition
): void {
  chartSelection.attr('data-legend-position', position);
}
