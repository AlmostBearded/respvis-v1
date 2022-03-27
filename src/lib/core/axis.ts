import {
  Axis as D3Axis,
  AxisDomain,
  axisLeft as d3AxisLeft,
  axisBottom as d3AxisBottom,
  AxisScale,
  ticks,
} from 'd3';
import { scaleLinear } from 'd3';
import { BaseType, select, Selection } from 'd3';
import { SelectionOrTransition, Transition } from 'd3';
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

export function axisLeftRender(selection: AxisSelection): void {
  selection
    .each((d, i, g) => axisRender(select(g[i]), d3Axis(d3AxisLeft, d), d.title, d.subtitle))
    .classed('axis-left', true);
}

export function axisBottomRender(selection: AxisSelection): void {
  selection
    .each((d, i, g) => axisRender(select(g[i]), d3Axis(d3AxisBottom, d), d.title, d.subtitle))
    .classed('axis-bottom', true);
}

function axisRender(
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

  ticksS.selectAll('.tick').append('g').classed('pivot', true);
  ticksS.selectAll<Element, any>('.tick').each((d, i, g) => {
    const tickS = select(g[i]);
    const textS = tickS.select('text');
    const x = textS.attr('x') || '0';
    const y = textS.attr('y') || '0';
    textS.attr('x', null).attr('y', null);
    const pivotS = tickS.select('.pivot')!;
    pivotS.attr('transform', `translate(${x}, ${y})`);
    pivotS.append(() => textS.node());
  });

  ticksS.selectAll('.tick line').attr('stroke', null);
  ticksS.selectAll('.tick text').attr('fill', null).attr('dx', null).attr('dy', null);
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
