import { BaseType, select, Selection, selection } from 'd3-selection';
import 'd3-transition';
import { Rect } from './rect';

export type GridContentPlacement =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'space-around'
  | 'space-between'
  | 'space-evenly';

export interface LayoutProperties {
  'grid-template-rows': string;
  'grid-template-columns': string;
  'grid-template': string;
  'grid-row-start': number;
  'grid-row-end': number;
  'grid-column-start': number;
  'grid-column-end': number;
  'grid-row': string;
  'grid-column': string;
  'grid-area': string;
  'place-items': string;
  'justify-items': string;
  'align-items': string;
  'place-self': string;
  'justify-self': string;
  'align-self': string;
  width: number | string;
  height: number | string;
  display: 'grid';
  'margin-left': number;
  'margin-right': number;
  'margin-top': number;
  'margin-bottom': number;
  'margin-horizontal': number;
  'margin-vertical': number;
  margin: number;
  'justify-content': GridContentPlacement;
  'align-content': GridContentPlacement;
  'place-content': string;
  layout: Rect<number>;
}

declare module 'd3-selection' {
  export interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    // mapData(mapFunction: (data: Datum, index: number) => Datum): this;
    // mergeData(data: [Partial<Datum>]): this;
    // mergeData(data: (data: Datum, index: number) => Partial<Datum>): this;
    // dataProperty<Name extends keyof Datum, Value extends Datum[Name]>(
    //   name: Name,
    //   value: Value
    // ): this;
    dataProperty<Name extends keyof Datum, Value extends Datum[Name]>(
      name: Name,
      value: (currentValue: Value, index: number) => Value
    ): this;
    // todo: add mapDatum function
    // meta(name: string): any;
    // meta(name: string, value: null): this;
    // meta(name: string, value: any): this;
    // withMetaTypes<
    //   MetaProperties extends Record<string, any> | undefined = undefined
    // >(): SelectionWithMetaTypes<GElement, Datum, PElement, PDatum, MetaProperties>;
    layout<Value extends LayoutProperties['layout']>(): Value | null;
    layout<Key extends keyof LayoutProperties, Value extends LayoutProperties[Key]>(
      name: Key
    ): Value | null;
    layout<Key extends keyof LayoutProperties, Value extends LayoutProperties[Key]>(
      name: Key,
      value: Value
    ): this;
    layout<Key extends keyof LayoutProperties>(name: Key, value: null): this;
    layout<Key extends keyof LayoutProperties, Value extends LayoutProperties[Key]>(
      name: Key,
      value: (data: Datum, index: number) => Value | null
    ): this;
    // layoutBoundsCalculator(): ((element: Element) => ISize) | undefined;
    // layoutBoundsCalculator(callback: null): this;
    // layoutBoundsCalculator(callback: (element: Element) => ISize): this;
    transformAttr(
      name: string,
      transform: (
        this: GElement,
        currentValue: string | number | boolean | null,
        index: number
      ) => string | number | boolean | null
    ): this;
    transformDatum<TransformedDatum>(
      transform: (this: GElement, currentDatum: Datum) => TransformedDatum
    ): Selection<GElement, TransformedDatum, PElement, PDatum>;
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
    index: number
  ) => string | number | boolean | null
): Selection<GElement, Datum, PElement, PDatum> {
  return this.attr(name, function (d, i) {
    return transform.call(this, select(this).attr(name), i);
  });
};

selection.prototype.transformDatum = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum,
  TransformedDatum
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  transform: (this: GElement, currentDatum: Datum) => TransformedDatum
): Selection<GElement, TransformedDatum, PElement, PDatum> {
  return this.datum<TransformedDatum>(transform.call(this.node(), this.datum()));
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

selection.prototype.dataProperty = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum,
  Name extends keyof Datum,
  Value extends Datum[Name]
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  name: Name,
  value: (currentValue: Value, index: number) => Value
): Selection<GElement, Datum, PElement, PDatum> {
  return this.data(
    this.data().map((d, i) => ({
      ...d,
      ...{ [name]: value(d[name] as Value, i) },
    }))
  );
};

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

selection.prototype.layout = function <
  GElement extends BaseType,
  Datum,
  PElement extends BaseType,
  PDatum,
  Key extends keyof LayoutProperties,
  Value extends LayoutProperties[Key]
>(
  this: Selection<GElement, Datum, PElement, PDatum>,
  name?: Key,
  value?: Value | null | ((data: Datum, index: number) => Value | null)
): Value | null | Selection<GElement, Datum, PElement, PDatum> {
  if (name === undefined) return this.layout('layout');
  if (value === undefined) return this.property('__layout')?.[name] || null;

  this.each((d, i, groups) => {
    const s = select(groups[i]);
    const layout = s.property('__layout') || {};
    const v = value instanceof Function ? value(d, i) : value;
    if (v === null) delete layout[name];
    else layout[name] = v;
    s.property('__layout', layout);
  });

  return this;
};

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
