import {
  Axis,
  AxisDomain,
  axisLeft as d3AxisLeft,
  axisBottom as d3AxisBottom,
  AxisScale,
} from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import { rectFromString } from '../core';
import { Position } from '../core/utils';

export interface ConfigureAxisFn {
  (axis: Axis<AxisDomain>): void;
}

export interface DataAxis {
  scale: AxisScale<AxisDomain>;
  configureAxis: ConfigureAxisFn;
}

export const DATA_AXIS: DataAxis = {
  scale: scaleLinear().domain([0, 1]).range([0, 600]),
  configureAxis: () => {},
};

// export function makeLeftAxis<
//   GElement extends SVGSVGElement | SVGGElement,
//   Datum,
//   PElement extends BaseType,
//   PDatum
// >(
//   selection: Selection<GElement, Datum, PElement, PDatum>
// ): Selection<GElement, Datum & AxisData, PElement, PDatum> {
//   return makeAxis(selection);
//   // .on('render.axisleft', function (e, d) {
//   //   select<GElement, AxisData>(this).call(renderLeftAxis);
//   // });
// }

// export function makeBottomAxis<
//   GElement extends SVGSVGElement | SVGGElement,
//   Datum,
//   PElement extends BaseType,
//   PDatum
// >(
//   selection: Selection<GElement, Datum, PElement, PDatum>
// ): Selection<GElement, Datum & AxisData, PElement, PDatum> {
//   return makeAxis(selection);
// }

// function makeAxis<
//   GElement extends SVGSVGElement | SVGGElement,
//   Datum,
//   PElement extends BaseType,
//   PDatum
// >(
//   selection: Selection<GElement, Datum, PElement, PDatum>
// ): Selection<GElement, Datum & AxisData, PElement, PDatum> {
//   return selection.transformData((d) => Object.assign({}, DEFAULT_DATA, d)).classed('axis', true);
//   // .on('render.axis', function (e, d) {
//   //   select<GElement, AxisData>(this).call(renderAxis);
//   // });
// }

// export function renderLeftAxis(
//   selection: Selection<BaseType, AxisData, BaseType, any>,
//   axis: Axis<unknown>
// ): void {
//   renderAxis(selection, axis);
//   const layoutAttr = selection.attr('layout');
//   console.assert(layoutAttr);
//   const layout = rectFromString(layoutAttr);
//   const layoutTranslation = `translate(${layout.width}, 0)`;
//   selection.selectAll('.tick').transformAttr('transform', (v) => `${v}${layoutTranslation}`);
//   selection.select('.domain').attr('transform', layoutTranslation);
// }

// export function renderBottomAxis(
//   selection: Selection<BaseType, AxisData, BaseType, any>,
//   axis: Axis<unknown>
// ): void {
//   renderAxis(selection, axis);
// }

// function renderAxis(
//   selection: Selection<BaseType, AxisData, BaseType, any>,
//   axis: Axis<unknown>
// ): void {
//   selection.each((d, i, g) => select(g[i]).call(axis)).attr('fill', null);
//   selection
//     .selectAll<SVGTextElement, unknown>('.tick text')
//     .attr('fill', null)
//     .call(xyAttrsToTransformAttr);
//   selection.select('.domain').attr('fill', 'none');
// }

export function dataAxis(data?: Partial<DataAxis>): DataAxis {
  return { ...DATA_AXIS, ...data };
}

export function axisLeft<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum & DataAxis, PElement, PDatum> {
  return axis(selection).on('render.axisleft', function (e, d) {
    renderAxisLeft(select<GElement, Datum & DataAxis>(this));
  });
}

export function renderAxisLeft<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => {
    const s = select(g[i]);
    renderAxis(s, d3Axis(d3AxisLeft, d));
    const layoutTranslation = `translate(${s.layout().width}, 0)`;
    s.selectAll('.tick').transformAttr('transform', (v) => `${v}${layoutTranslation}`);
    s.select('.domain').attr('transform', layoutTranslation);
  });
}

export function axisBottom<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum & DataAxis, PElement, PDatum> {
  return axis(selection).on('render.axisbottom', function (e, d) {
    renderAxisBottom(select<GElement, Datum & DataAxis>(this));
  });
}

export function renderAxisBottom<
  GElement extends SVGSVGElement | SVGGElement,
  Datum extends DataAxis,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => renderAxis(select(g[i]), d3Axis(d3AxisBottom, d)));
}

function axis<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum & DataAxis, PElement, PDatum> {
  return selection.classed('axis', true).transformData((d) => Object.assign(d || {}, DATA_AXIS, d));
}

function renderAxis<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>,
  axis: Axis<AxisDomain>
): Selection<GElement, Datum, PElement, PDatum> {
  selection.call(axis).attr('fill', null);
  selection
    .selectAll<SVGTextElement, unknown>('.tick text')
    .attr('fill', null)
    .call(xyAttrsToTransformAttr);
  selection.select('.domain').attr('fill', 'none');
  return selection;
}

function d3Axis(
  axisGenerator: (scale: AxisScale<AxisDomain>) => Axis<AxisDomain>,
  data: DataAxis
): Axis<AxisDomain> {
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
