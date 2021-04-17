import { Axis, axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { initG } from '../core';
import { Position } from '../core/utils';

export interface Data {
  axis: Axis<any>;
}

export const DEFAULT_DATA: Data = {
  axis: axisLeft(scaleLinear().domain([0, 1]).range([0, 600])),
};

export function createData(): Data;
export function createData(partialData: Partial<Data>): Data;
export function createData(partialData?: Partial<Data>): Data {
  return { ...DEFAULT_DATA, ...partialData };
}

export function appendLeft<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<SVGGElement, Datum & Data, PElement, PDatum> {
  return initLeft(selection.append('g').call(initG));
}

export function appendBottom<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<SVGGElement, Datum & Data, PElement, PDatum> {
  return initBottom(selection.append('g').call(initG));
}

export function initLeft<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum & Data, PElement, PDatum> {
  return init(selection).on('render.axisleft', function (e, d) {
    const s = select<GElement, Data>(this);
    const layoutTranslation = `translate(${s.layout()!.width}, 0)`;
    s.selectAll('.tick').transformAttr('transform', (v) => `${v}${layoutTranslation}`);
    s.select('.domain').attr('transform', layoutTranslation);
  });
}

export function initBottom<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum & Data, PElement, PDatum> {
  return init(selection);
}

function init<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum & Data, PElement, PDatum> {
  return selection
    .transformDatum((d) => Object.assign({}, DEFAULT_DATA, d))
    .classed('axis', true)
    .on('render.axis', function (e, d) {
      select<GElement, Data>(this).call(render);
    });
}

function render(selection: Selection<BaseType, Data, BaseType, any>): void {
  selection.each(function (d) {
    select(this)
      .call(d.axis)
      .attr('fill', null)
      .call((s) => s.selectAll('.tick text').attr('fill', null).call(xyToTransformAttr))
      .call((s) => s.select('.domain').attr('fill', 'none'));
  });
}

export function xyToTransformAttr(selection: Selection<BaseType, any, BaseType, any>): void {
  selection.each(function () {
    select(this).call((s) =>
      s
        .attr('transform', `translate(${s.attr('x') || 0}, ${s.attr('y') || 0})`)
        .attr('x', null)
        .attr('y', null)
    );
  });
}

export function rotateLeftLabels(
  selection: Selection<BaseType, Data, BaseType, any>,
  rotation: number
): void {
  selection.each(function (d) {
    select(this)
      .selectAll('text')
      .attr(
        'transform',
        `translate(-${d.axis.tickSizeInner() + d.axis.tickPadding()}, 0)rotate(${rotation})`
      );
  });
}

export function rotateBottomLabels(
  selection: Selection<BaseType, Data, BaseType, any>,
  rotation: number
): void {
  selection.each(function (d) {
    select(this)
      .selectAll('text')
      .attr(
        'transform',
        `translate(0, ${d.axis.tickSizeInner() + d.axis.tickPadding()})rotate(${rotation})`
      );
  });
}

// export * from './ticks-component';
// export * from './left-ticks-component';
// export * from './right-ticks-component';
// export * from './bottom-ticks-component';
// export * from './top-ticks-component';
// export * from './axis-component';
// export * from './left-axis-component';
// export * from './bottom-axis-component';
// export * from './right-axis-component';
// export * from './top-axis-component';
// export * from './axis-position';
