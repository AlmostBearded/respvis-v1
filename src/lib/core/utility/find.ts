import { BaseType, Selection } from 'd3-selection';

export function findByDataProperty<GElement extends BaseType, Datum>(
  container: Selection,
  selector: string,
  property: keyof Datum,
  value: any
): Selection<GElement, Datum> {
  return container.selectAll<GElement, Datum>(selector).filter((d) => d[property] === value);
}

export function findByKey<GElement extends BaseType, Datum extends { key: string | number }>(
  container: Selection,
  selector: string,
  value: any
): Selection<GElement, Datum> {
  return container.selectAll<GElement, Datum>(selector).filter((d) => d['key'] === value);
}

export function findByIndex<GElement extends BaseType, Datum = unknown>(
  container: Selection,
  selector: string,
  index: number
): Selection<GElement, Datum> {
  return container.selectAll<GElement, Datum>(selector).filter((d, i) => i === index);
}
