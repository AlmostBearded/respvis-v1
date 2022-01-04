import {
  Axis as D3Axis,
  AxisDomain,
  axisLeft as d3AxisLeft,
  axisBottom as d3AxisBottom,
  AxisScale,
} from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SelectionOrTransition, Transition } from 'd3-transition';
import { textAlignVertical, VerticalAlignment, Orientation, textOrientation } from './utility/text';

export interface ConfigureAxisFn {
  (axis: D3Axis<AxisDomain>): void;
}

export interface Axis {
  scale: AxisScale<AxisDomain>;
  title: string;
  subtitle: string;
  configureAxis: ConfigureAxisFn;
}

export function axisData(data: Partial<Axis>): Axis {
  return {
    scale: data.scale || scaleLinear().domain([0, 1]).range([0, 600]),
    title: data.title || '',
    subtitle: data.subtitle || '',
    configureAxis: data.configureAxis || (() => {}),
  };
}

export type AxisSelection = Selection<SVGSVGElement | SVGGElement, Axis>;
export type AxisTransition = Transition<SVGSVGElement | SVGGElement, Axis>;

export function axisLeft(selection: AxisSelection): void {
  selection
    .each((d, i, g) => axis(select(g[i]), d3Axis(d3AxisLeft, d), d.title, d.subtitle))
    .classed('axis-left', true);

  selection.selectAll('.title text').call((s) => textOrientation(s, Orientation.Vertical));
  selection.selectAll('.subtitle text').call((s) => textOrientation(s, Orientation.Vertical));
  selection
    .selectAll('.tick text')
    .attr('dy', null)
    .call((s) => textAlignVertical(s, VerticalAlignment.Center));
}

export function axisLeftRender(selection: AxisSelection): void {}

export function axisBottom(selection: AxisSelection): void {
  selection
    .each((d, i, g) => axis(select(g[i]), d3Axis(d3AxisBottom, d), d.title, d.subtitle))
    .classed('axis-bottom', true);

  selection.selectAll('.title text').classed(Orientation.Horizontal, true);
  selection.selectAll('.subtitle text').classed(Orientation.Horizontal, true);
  selection
    .selectAll('.tick text')
    .attr('dy', null)
    .call((s) => textAlignVertical(s, VerticalAlignment.Bottom));
}

function axis(
  selection: AxisSelection,
  a: D3Axis<AxisDomain>,
  title: string,
  subtitle: string
): void {
  selection.classed('axis', true);

  const ticksS = selection
    .selectAll('.ticks-transform')
    .data([null])
    .join('g')
    .classed('ticks-transform', true)
    .selectAll<SVGGElement, any>('.ticks')
    .data([null])
    .join('g')
    .classed('ticks', true)
    .attr('data-ignore-layout-children', true);

  a(ticksS);

  ticksS
    .attr('fill', null)
    .attr('font-family', null)
    .attr('font-size', null)
    .attr('text-anchor', null);

  ticksS
    .selectAll<SVGGElement, string>('.tick')
    .attr('opacity', null)
    .attr('data-key', (d) => d);
  ticksS.selectAll('.tick line').attr('stroke', null);
  ticksS.selectAll('.tick text').attr('fill', null);
  ticksS.selectAll('.domain').attr('stroke', null).attr('fill', null);

  selection
    .selectAll('.title')
    .data([null])
    .join('g')
    .classed('title', true)
    .attr('data-ignore-layout-children', true)
    .selectAll('text')
    .data([null])
    .join('text')
    .text(title);

  selection
    .selectAll('.subtitle')
    .data([null])
    .join('g')
    .classed('subtitle', true)
    .attr('data-ignore-layout-children', true)
    .selectAll('text')
    .data([null])
    .join('text')
    .text(subtitle);
}

function d3Axis(
  axisGenerator: (scale: AxisScale<AxisDomain>) => D3Axis<AxisDomain>,
  data: Axis
): D3Axis<AxisDomain> {
  const axis = axisGenerator(data.scale);
  data.configureAxis(axis);
  return axis;
}

export function xyAttrsToTransformAttr(
  selection: SelectionOrTransition<Element, any, BaseType, any>
): void {
  selection
    .attr('transform', function () {
      return `translate(${this.getAttribute('x') || 0}, ${this.getAttribute('y') || 0})`;
    })
    .attr('x', null)
    .attr('y', null);
}
