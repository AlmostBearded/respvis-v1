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
import { debug, nodeToString } from './utility/log';
import { WritingMode } from './utility/text';

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
  axis(selection);

  selection.classed('axis-left', true);

  selection
    .selectAll<SVGTextElement, unknown>('.subtitle text')
    .classed(WritingMode.Vertical, true);

  selection
    .selectAll<SVGTextElement, unknown>('.title')
    .raise()
    .selectAll('text')
    .classed(WritingMode.Vertical, true);

  selection.selectAll('.ticks-transform').raise();

  selection
    .on('render.axisleft', function (e, d) {
      axisLeftRender(<AxisSelection>select(this));
    })
    .dispatch('render');
}

export function axisLeftRender(selection: AxisSelection): void {
  selection.each((d, i, g) => {
    debug(`render left axis on ${nodeToString(g[i])}`);
    const s = <AxisSelection>select(g[i]);
    axisRender(s, d3Axis(d3AxisLeft, d), d.title, d.subtitle);
    s.selectAll('.tick text').attr('dy', null).classed('center-vertical', true);
  });
}

export function axisBottom(selection: AxisSelection): void {
  axis(selection);
  selection.classed('axis-bottom', true);

  selection
    .selectAll<SVGTextElement, unknown>('.subtitle text')
    .classed(WritingMode.Horizontal, true);

  selection.selectAll<SVGTextElement, unknown>('.title text').classed(WritingMode.Horizontal, true);

  selection
    .on('render.axisbottom', function (e, d) {
      axisBottomRender(<AxisSelection>select(this));
    })
    .dispatch('render');
}

export function axisBottomRender(selection: AxisSelection): void {
  selection.each((d, i, g) => {
    debug(`render bottom axis on ${nodeToString(g[i])}`);
    const s = <AxisSelection>select(g[i]);
    axisRender(s, d3Axis(d3AxisBottom, d), d.title, d.subtitle);
    s.selectAll('.tick text').attr('dy', null).classed('bottom', true);
  });
}

function axis(selection: AxisSelection): void {
  selection
    .classed('axis', true)
    .call((s) =>
      s
        .append('g')
        .classed('ticks-transform', true)
        .append('g')
        .classed('ticks', true)
        .attr('ignore-layout-children', true)
    )
    .call((s) =>
      s.append('g').classed('title', true).attr('ignore-layout-children', true).append('text')
    )
    .call((s) =>
      s.append('g').classed('subtitle', true).attr('ignore-layout-children', true).append('text')
    )
    .on('datachange.axis', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    });
}

function axisRender(
  selection: AxisSelection,
  axis: D3Axis<AxisDomain>,
  title: string,
  subtitle: string
): void {
  selection
    .call((s) =>
      s
        .selectAll<SVGGElement, unknown>('.ticks')
        .call((ticks) => axis(ticks))
        .call((ticks) =>
          ticks
            .attr('fill', null)
            .attr('font-family', null)
            .attr('font-size', null)
            .attr('text-anchor', null)
            .call((t) => t.selectAll<SVGGElement, string>('.tick').attr('data-key', (d) => d))
            .call((t) => t.selectAll('.tick line').attr('stroke', null))
            .call((t) => t.selectAll('.tick text').attr('fill', null))
            .call((t) => t.selectAll('.domain').attr('stroke', null).attr('fill', null))
        )
    )
    .call((s) => s.selectAll<SVGGElement, unknown>('.title text').text(title))
    .call((s) => s.selectAll<SVGGElement, unknown>('.subtitle text').text(subtitle));
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
