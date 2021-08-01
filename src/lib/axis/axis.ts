import {
  Axis as D3Axis,
  AxisDomain,
  axisLeft as d3AxisLeft,
  axisBottom as d3AxisBottom,
  AxisScale,
} from 'd3-axis';
import { easeCubicOut } from 'd3-ease';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SelectionOrTransition, Transition } from 'd3-transition';
import {
  debug,
  findByIndex,
  nodeToString,
  textHorizontalAttrs,
  textTitleAttrs,
  textVerticalAttrs,
} from '../core';

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

  selection
    .classed('axis-left', true)
    .layout('display', 'flex')
    .layout('flex-direction', 'row')
    .layout('justify-content', 'flex-start')
    .call(
      (s) =>
        s.selectAll<SVGTextElement, unknown>('.subtitle').call((title) => textVerticalAttrs(title)) //.layout('grid-area', '2 / 1'))
    )
    .call((s) =>
      s
        .selectAll<SVGTextElement, unknown>('.title')
        .layout('margin-right', '0.5em')
        // .layout('grid-area', '1 / 1')
        .call((title) => textVerticalAttrs(title))
        .call((title) => textTitleAttrs(title))
        .raise()
    )
    .call((s) =>
      s
        .selectAll('.ticks-transform')
        // .layout('grid-area', '1 / 2 / 3')
        .layout('width', 'fit')
        .layout('height', '100%')
        .raise()
        .selectAll('.ticks')
        .layout('width', '100%')
        .layout('height', '100%')
        .layout('margin-left', '100%')
    )
    .on('render.axisleft', function (e, d) {
      axisLeftTransition(
        (<AxisSelection>select(this)).transition('axis').duration(0).ease(easeCubicOut)
      );
    })
    .dispatch('render');
}

export function axisLeftTransition(transition: AxisTransition): void {
  transition.each((d, i, g) => {
    debug(`transition left axis on ${nodeToString(g[i])}`);
    const s = <AxisSelection>select(g[i]);
    const t = s.transition(transition);
    axisTransition(t, d3Axis(d3AxisLeft, d), d.title, d.subtitle);
    s.selectAll('.tick text').attr('dy', null).attr('dominant-baseline', 'middle');
  });
}

export function axisBottom(selection: AxisSelection): void {
  axis(selection);
  selection
    .classed('axis-bottom', true)
    .layout('display', 'flex')
    .layout('flex-direction', 'column')
    .layout('align-items', 'flex-end')
    .call((s) => s.selectAll('.ticks-transform').layout('height', 'fit').layout('width', '100%'))
    .call((s) =>
      s
        .selectAll<SVGTextElement, unknown>('.title')
        .layout('margin-top', '0.5em')
        .call((title) => textHorizontalAttrs(title))
        .call((title) => textTitleAttrs(title))
    )
    .call((s) =>
      s.selectAll<SVGTextElement, unknown>('.subtitle').call((title) => textHorizontalAttrs(title))
    )
    .on('render.axisbottom', function (e, d) {
      axisBottomTransition(
        (<AxisSelection>select(this)).transition('axis').duration(0).ease(easeCubicOut)
      );
    })
    .dispatch('render');
}

export function axisBottomTransition(transition: AxisTransition): void {
  transition.each((d, i, g) => {
    debug(`transition bottom axis on ${nodeToString(g[i])}`);
    const s = <AxisSelection>select(g[i]);
    axisTransition(s.transition(transition), d3Axis(d3AxisBottom, d), d.title, d.subtitle);
    s.selectAll('.tick text').attr('dy', null).attr('dominant-baseline', 'hanging');
  });
}

function axis(selection: AxisSelection): void {
  selection
    .classed('axis', true)
    .attr('font-size', '0.7em')
    .call((s) => s.append('g').classed('ticks-transform', true).append('g').classed('ticks', true))
    .call((s) => s.append('text').classed('title', true))
    .call((s) => s.append('text').classed('subtitle', true))
    .on('datachange.axis', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    });
}

function axisTransition(
  transition: AxisTransition,
  axis: D3Axis<AxisDomain>,
  title: string,
  subtitle: string
): void {
  transition
    .call((t) =>
      t
        .selectAll<SVGGElement, unknown>('.ticks')
        .call((ticks) => axis(ticks))
        .call((ticks) =>
          ticks
            .attr('fill', null)
            .attr('font-family', null)
            .attr('font-size', null)
            .call((t) => t.selectAll<SVGTextElement, unknown>('.tick text').attr('fill', null))
            .call((t) => t.selectAll('.domain').attr('fill', 'none'))
        )
    )
    .call((t) => t.selectAll<SVGGElement, unknown>('.title').text(title))
    .call((t) => t.selectAll<SVGGElement, unknown>('.subtitle').text(subtitle));
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

export function axisTickFindByIndex(container: Selection, index: number): Selection<SVGGElement> {
  return findByIndex<SVGGElement>(container, '.tick', index);
}

export function axisTickHighlight(tick: Selection, highlight: boolean): void {
  if (highlight) tick.attr('text-decoration', 'underline');
  else tick.attr('text-decoration', null);
}
