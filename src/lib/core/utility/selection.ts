import { BaseType, selectAll, Selection } from 'd3-selection';
import { Transition } from 'd3-transition';

declare module 'd3-transition' {
  export interface Transition<
    // provide default type parameters
    GElement extends BaseType = BaseType,
    Datum = unknown,
    PElement extends BaseType = BaseType,
    PDatum = unknown
  > {}
}

declare module 'd3-selection' {
  export interface Selection<
    // provide default type parameters
    GElement extends BaseType = BaseType,
    Datum = unknown,
    PElement extends BaseType = BaseType,
    PDatum = unknown
  > {
    attr(name: string): string | null; // add null return value
    dispatch(type: string, parameters?: Partial<CustomEventParameters>): this; // allow Partial parameters
  }
}

export type SelectionOrTransition<
  // provide default type parameters
  GElement extends BaseType = BaseType,
  Datum = unknown,
  PElement extends BaseType = BaseType,
  PDatum = unknown
> = Selection<GElement, Datum, PElement, PDatum> | Transition<GElement, Datum, PElement, PDatum>;

export function isSelection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selectionOrTransition: SelectionOrTransition<GElement, Datum, PElement, PDatum>
): selectionOrTransition is Selection<GElement, Datum, PElement, PDatum> {
  return selectionOrTransition['enter'] && selectionOrTransition['exit'];
}

export function isTransition<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selectionOrTransition: SelectionOrTransition<GElement, Datum, PElement, PDatum>
): selectionOrTransition is Transition<GElement, Datum, PElement, PDatum> {
  return !isSelection(selectionOrTransition);
}
