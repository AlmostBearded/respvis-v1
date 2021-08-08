import { BaseType, select, selectAll, Selection, selection, ValueFn } from 'd3-selection';
import 'd3-transition';
import { Transition } from 'd3-transition';
import { debug, nodeToString } from './log';
import { Rect, rectFromString, rectToString } from './utility/rect';

declare module 'd3-transition' {
  export interface Transition<
    GElement extends BaseType = BaseType,
    Datum = unknown,
    PElement extends BaseType = BaseType,
    PDatum = unknown
  > {}
}

export type SelectionOrTransition<
  GElement extends BaseType = BaseType,
  Datum = unknown,
  PElement extends BaseType = BaseType,
  PDatum = unknown
> = Selection<GElement, Datum, PElement, PDatum> | Transition<GElement, Datum, PElement, PDatum>;

declare module 'd3-selection' {
  export interface Selection<
    GElement extends BaseType = BaseType,
    Datum = unknown,
    PElement extends BaseType = BaseType,
    PDatum = unknown
  > {
    // transformAttr(
    //   name: string,
    //   transform: (
    //     this: GElement,
    //     currentValue: string | number | boolean | null,
    //     index: number,
    //     groups: GElement[]
    //   ) => string | number | boolean | null
    // ): this;

    // transformData<TransformedDatum>(
    //   transform: (
    //     this: GElement,
    //     currentData: Datum,
    //     index: number,
    //     groups: GElement[]
    //   ) => TransformedDatum
    // ): Selection<GElement, TransformedDatum, PElement, PDatum>;

    // transformCall<GElement extends BaseType, Datum, PElement extends BaseType, PDatum, Result>(
    //   transform: (selection: Selection<GElement, Datum, PElement, PDatum>) => Result
    // ): Result;

    layout(name: string): string | null;
    layout(
      name: string,
      value:
        | string
        | number
        | boolean
        | ValueFn<GElement, Datum, string | number | boolean | null>
        | null
    ): this;

    bounds(): Rect | null;
    bounds(bounds: Rect | null | ValueFn<GElement, Datum, Rect | null>): this;

    dispatch(type: string, parameters?: Partial<CustomEventParameters>): this;
  }
}

// selection.prototype.transformAttr = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   name: string,
//   transform: (
//     this: GElement,
//     currentValue: string | number | boolean | null,
//     index: number,
//     groups: GElement[]
//   ) => string | number | boolean | null
// ): Selection<GElement, Datum, PElement, PDatum> {
//   return this.attr(name, function (d, i, g) {
//     return transform.call(this, select(this).attr(name), i, g);
//   });
// };

// selection.prototype.transformData = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum,
//   TransformedDatum
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   transform: (
//     this: GElement,
//     currentDatum: Datum,
//     index: number,
//     groups: GElement[]
//   ) => TransformedDatum
// ): Selection<GElement, TransformedDatum, PElement, PDatum> {
//   return this.data<TransformedDatum>(
//     this.data().map((d, i) => transform.call(this.nodes()[i], d, i, this.nodes()))
//   );
// };

// selection.prototype.transformCall = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum,
//   Result
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   transform: (selection: Selection<GElement, Datum, PElement, PDatum>) => Result
// ): Result {
//   return transform(this);
// };

selection.prototype.layout = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  name: string,
  value?:
    | string
    | number
    | boolean
    | ValueFn<GElement, Datum, string | number | boolean | null>
    | null
): string | null | Selection<GElement, Datum, PElement, PDatum> {
  const regex = `(?<![-a-zA-Z])${name}: (.+?);`;
  if (value === undefined) return this.attr('layout')?.match(regex)?.[1] || null;
  this.each((d, i, g) => {
    const v = value instanceof Function ? value.call(g[i], d, i, g) : value;
    const s = select(g[i]);
    const layout = s.attr('layout') || '';
    let newLayout = layout.replace(new RegExp(regex), '');
    if (v !== null) newLayout = newLayout.concat(` ${name}: ${v};`).trim();
    s.attr('layout', newLayout);
  });
  return this;
};

selection.prototype.bounds = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  bounds?: Rect | null | ValueFn<GElement, Datum, Rect | null>
): Rect | null | Selection<GElement, Datum, PElement, PDatum> {
  if (bounds === undefined)
    return (this.attr('bounds') && rectFromString(this.attr('bounds'))) || null;
  this.each((d, i, g) => {
    const v = bounds instanceof Function ? bounds.call(g[i], d, i, g) : bounds;
    const s = select(g[i]);
    if (v === null) s.attr('bounds', null);
    else s.attr('bounds', rectToString(v));
  });
  return this;
};

const originalDatum = selection.prototype.datum;
selection.prototype.datum = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum
>(this: Selection<GElement, Datum, PElement, PDatum>, datum?: any): any {
  if (datum === undefined) return originalDatum.call(this);
  return originalDatum.call(this, datum).dispatch('datachange');
};

// todo: this should be tested. particularly regarding data joins.
const originalData = selection.prototype.data;
selection.prototype.data = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum
>(this: Selection<GElement, Datum, PElement, PDatum>, data?: any, key?: any): any {
  if (data === undefined) return originalData.call(this);
  return originalData.call(this, data, key).dispatch('datachange');
};

export function isTransition<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selectionOrTransition: SelectionOrTransition<GElement, Datum, PElement, PDatum>
): selectionOrTransition is Transition<GElement, Datum, PElement, PDatum> {
  return (selectionOrTransition as Selection<GElement, Datum>).enter === undefined;
}
