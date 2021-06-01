import { BaseType, select, Selection, selection, ValueFn } from 'd3-selection';
import 'd3-transition';
import { Transition } from 'd3-transition';
import { debug, nodeToString } from './log';
import { Rect, rectFromString, rectToString } from './utility/rect';

export const LAYOUT_ATTR_NAMES = [
  'grid-template-rows',
  'grid-template-columns',
  'grid-template',
  'grid-row-start',
  'grid-row-end',
  'grid-column-start',
  'grid-column-end',
  'grid-row',
  'grid-column',
  'grid-area',
  'place-items',
  'justify-items',
  'align-items',
  'place-self',
  'justify-self',
  'align-self',
  'grid-width',
  'grid-height',
  'display',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'margin-horizontal',
  'margin-vertical',
  'margin',
  'justify-content',
  'align-content',
  'place-content',
  // 'layout',
];

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
    transformAttr(
      name: string,
      transform: (
        this: GElement,
        currentValue: string | number | boolean | null,
        index: number,
        groups: GElement[]
      ) => string | number | boolean | null
    ): this;

    transformData<TransformedDatum>(
      transform: (
        this: GElement,
        currentData: Datum,
        index: number,
        groups: GElement[]
      ) => TransformedDatum
    ): Selection<GElement, TransformedDatum, PElement, PDatum>;

    transformCall<GElement extends BaseType, Datum, PElement extends BaseType, PDatum, Result>(
      transform: (selection: Selection<GElement, Datum, PElement, PDatum>) => Result
    ): Result;

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

selection.prototype.transformAttr = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  name: string,
  transform: (
    this: GElement,
    currentValue: string | number | boolean | null,
    index: number,
    groups: GElement[]
  ) => string | number | boolean | null
): Selection<GElement, Datum, PElement, PDatum> {
  return this.attr(name, function (d, i, g) {
    return transform.call(this, select(this).attr(name), i, g);
  });
};

selection.prototype.transformData = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum,
  TransformedDatum
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  transform: (
    this: GElement,
    currentDatum: Datum,
    index: number,
    groups: GElement[]
  ) => TransformedDatum
): Selection<GElement, TransformedDatum, PElement, PDatum> {
  return this.data<TransformedDatum>(
    this.data().map((d, i) => transform.call(this.nodes()[i], d, i, this.nodes()))
  );
};

selection.prototype.transformCall = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum,
  Result
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  transform: (selection: Selection<GElement, Datum, PElement, PDatum>) => Result
): Result {
  return transform(this);
};

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
  const regex = ` *${name}: (.+);`;
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
  // this.each((d, i, g) => debug(`data change on ${nodeToString(g[i] as Element)}`));
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
  // this.each((d, i, g) => debug(`data change on ${nodeToString(g[i] as Element)}`));
  return originalData.call(this, data, key).dispatch('datachange');
};

// export interface SelectionWithMetaTypes<
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum,
//   MetaProperties extends Record<string, any> | undefined = undefined
// > extends Selection<GElement, Datum, PElement, PDatum> {
//   meta<
//     Key extends MetaProperties extends undefined ? string : keyof MetaProperties,
//     Value extends Key extends keyof MetaProperties ? MetaProperties[Key] : any
//   >(
//     name: Key
//   ): Value | null;
//   meta<Key extends MetaProperties extends undefined ? string : keyof MetaProperties>(
//     name: Key,
//     value: null
//   ): this;
//   meta<
//     Key extends MetaProperties extends undefined ? string : keyof MetaProperties,
//     Value extends Key extends keyof MetaProperties ? MetaProperties[Key] : any
//   >(
//     name: Key,
//     value: Value
//   ): this;
// }

// selection.prototype.mapData = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   mapFunction: (data: Datum, index: number) => Datum
// ): Selection<GElement, Datum, PElement, PDatum> {
//   return this.data(this.data().map(mapFunction));
// };

// selection.prototype.mergeData = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   data: [Partial<Datum>] | ((data: Datum, index: number) => Partial<Datum>)
// ): Selection<GElement, Datum, PElement, PDatum> {
//   // todo: what if data array is incorrect size?
//   return this.data(
//     this.data().map((d, i) => ({ ...d, ...(data instanceof Function ? data(d, i) : data[i]) }))
//   );
// };

// selection.prototype.dataProperty = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum,
//   Name extends keyof Datum,
//   Value extends Datum[Name]
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   name: Name,
//   value: (currentValue: Value, index: number) => Value
// ): Selection<GElement, Datum, PElement, PDatum> {
//   return this.data(
//     this.data().map((d, i) => ({
//       ...d,
//       ...{ [name]: value(d[name] as Value, i) },
//     }))
//   );
// };

// selection.prototype.meta = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   name: string,
//   value?: any
// ): any | Selection<GElement, Datum, PElement, PDatum> {
//   if (value === undefined) return this.property('__meta')?.[name] || null;

//   this.each((d, i, groups) => {
//     const s = select(groups[i]);
//     const meta = s.property('__meta') || {};
//     if (value === null) delete meta[name];
//     else meta[name] = value;
//     s.property('__meta', meta);
//   });

//   return this;
// };

// selection.prototype.withMetaTypes = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum,
//   MetaProperties extends Record<string, any> | undefined = undefined
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>
// ): SelectionWithMetaTypes<GElement, Datum, PElement, PDatum, MetaProperties> {
//   return this;
// };

// selection.prototype.layout = function <
//   GElement extends BaseType,
//   Datum,
//   PElement extends BaseType,
//   PDatum,
//   Key extends keyof LayoutProperties,
//   Value extends LayoutProperties[Key]
// >(
//   this: Selection<GElement, Datum, PElement, PDatum>,
//   name?: Key,
//   value?: Value | null | ((data: Datum, index: number) => Value | null)
// ): Value | null | Selection<GElement, Datum, PElement, PDatum> {
//   if (name === undefined) return this.layout('layout');
//   if (value === undefined) return this.property('__layout')?.[name] || null;

//   this.each((d, i, groups) => {
//     const s = select(groups[i]);
//     const layout = s.property('__layout') || {};
//     const v = value instanceof Function ? value(d, i) : value;
//     if (v === null) delete layout[name];
//     else layout[name] = v;

//     s.property('__layout', layout);
//   });

//   return this;
// };

// selection.prototype.layoutBoundsCalculator = function (
//   this: Selection<BaseType & LaidOutElement, any, any, any>,
//   callback?: ((element: Element) => ISize) | null
// ): ((element: Element) => ISize) | undefined | Selection<BaseType & LaidOutElement, any, any, any> {
//   if (callback === undefined) return this.node()?.__layout?.getBounds;
//   this.each((d, i, groups) => {
//     let layout = groups[i].__layout;
//     if (!layout) layout = groups[i].__layout = {};
//     if (callback === null) delete layout.getBounds;
//     else layout.getBounds = callback;
//   });

//   return this;
// };

export function isTransition<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selectionOrTransition: SelectionOrTransition<GElement, Datum, PElement, PDatum>
): selectionOrTransition is Transition<GElement, Datum, PElement, PDatum> {
  return (selectionOrTransition as Selection<GElement, Datum>).enter === undefined;
}
