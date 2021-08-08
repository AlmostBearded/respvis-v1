import { select, Selection } from 'd3-selection';

export function classOneOf(selection: Selection<Element>, array: string[], activeValue: string) {
  array.forEach((v) => selection.classed(v, v === activeValue));
}

export function classOneOfEnum<Enum extends Record<string, string>>(
  selection: Selection<Element>,
  enumObject: Enum,
  activeValue: string
) {
  classOneOf(selection, Object.values(enumObject), activeValue);
}
