import {
  Axis as D3Axis,
  AxisDomain,
  axisLeft as d3AxisLeft,
  axisBottom as d3AxisBottom,
  AxisScale,
} from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import { debug, findByIndex, nodeToString, WritingMode } from '../core';
import { DataHydrateFn } from '../core/utility/data';

export interface ConfigureAxisFn {
  (axis: D3Axis<AxisDomain>): void;
}

export interface Axis {
  scale: AxisScale<AxisDomain>;
  title: string;
  subtitle: string;
  configureAxis: ConfigureAxisFn;
}

export function axisDataHydrate(data: Partial<Axis>): Axis {
  return {
    scale: data.scale || scaleLinear().domain([0, 1]).range([0, 600]),
    title: data.title || '',
    subtitle: data.subtitle || '',
    configureAxis: data.configureAxis || (() => {}),
  };
}

export type AxisSelection = Selection<SVGSVGElement | SVGGElement, Partial<Axis>>;

export function axisLeft(
  selection: AxisSelection,
  dataHydrate: DataHydrateFn<Axis> = axisDataHydrate
): void {
  selection.classed('axis-left', true).each(function (d) {
    debug(`render left axis on ${nodeToString(this)}`);
    const axisD = dataHydrate(d);
    (<AxisSelection>select(this))
      .call((s) => axis(s, d3Axis(d3AxisLeft, axisD), axisD.title, axisD.subtitle))
      .selectAll('.tick text')
      .attr('dy', null)
      .classed('center-vertical', true);
  });

  selection.selectAll('.subtitle').classed(WritingMode.Vertical, true);
  selection.selectAll('.title').classed(WritingMode.Vertical, true).raise();
  selection.selectAll('.ticks-transform').raise();
}

export function axisBottom(
  selection: AxisSelection,
  dataHydrate: DataHydrateFn<Axis> = axisDataHydrate
): void {
  selection.classed('axis-bottom', true).each(function (d) {
    debug(`render bottom axis on ${nodeToString(this)}`);
    const axisD = dataHydrate(d);
    (<AxisSelection>select(this))
      .call((s) => axis(s, d3Axis(d3AxisBottom, axisD), axisD.title, axisD.subtitle))
      .selectAll('.tick text')
      .attr('dy', null)
      .classed('bottom', true);
  });

  selection.selectAll('.subtitle').classed(WritingMode.Horizontal, true);
  selection.selectAll('.title').classed(WritingMode.Horizontal, true);
}

function axis(
  selection: AxisSelection,
  axis: D3Axis<AxisDomain>,
  title: string,
  subtitle: string
): void {
  selection.classed('axis', true);

  selection
    .selectAll<SVGGElement, null>('.ticks-transform')
    .data([null])
    .join('g')
    .classed('ticks-transform', true)
    .selectAll<SVGGElement, null>('.ticks')
    .data([null])
    .join('g')
    .classed('ticks', true)
    .attr('ignore-layout-children', true)
    .call((s) => axis(s))
    .attr('fill', null)
    .attr('font-family', null)
    .attr('font-size', null)
    .attr('text-anchor', null)
    .call((t) => t.selectAll<SVGTextElement, unknown>('.tick line').attr('stroke', null))
    .call((t) => t.selectAll<SVGTextElement, unknown>('.tick text').attr('fill', null))
    .call((t) => t.selectAll('.domain').attr('stroke', null).attr('fill', null));

  selection
    .selectAll('.title')
    .data([title])
    .join('text')
    .classed('title', true)
    .text((d) => d);

  selection
    .selectAll('.subtitle')
    .data([subtitle])
    .join('text')
    .classed('subtitle', true)
    .text((d) => d);
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
