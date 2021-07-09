import { BaseType, Selection, ValueFn } from 'd3-selection';

export function findByFilter<GElement extends BaseType, Datum = unknown>(
  container: Selection,
  selector: string,
  filter: ValueFn<GElement, Datum, boolean>
): Selection<GElement, Datum> {
  return container.selectAll<GElement, Datum>(selector).filter(filter);
}

export function findByDataProperty<GElement extends BaseType, Datum>(
  container: Selection,
  selector: string,
  property: keyof Datum,
  value: any
): Selection<GElement, Datum> {
  return findByFilter<GElement, Datum>(container, selector, (d) => d[property] === value);
}

export function findByKey<GElement extends BaseType, Datum extends { key: string | number }>(
  container: Selection,
  selector: string,
  key: string | number
): Selection<GElement, Datum> {
  return findByDataProperty<GElement, Datum>(container, selector, 'key', key);
}

export function findByIndex<GElement extends BaseType, Datum = unknown>(
  container: Selection,
  selector: string,
  index: number
): Selection<GElement, Datum> {
  return findByFilter<GElement, Datum>(container, selector, (d, i) => i === index);
}
