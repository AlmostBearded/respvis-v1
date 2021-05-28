import { BaseType, select, selectAll, Selection } from 'd3-selection';

export function eventBroadcast<GElement extends Element, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>,
  eventType: string
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each(function (d, i, g) {
    select(this).dispatch(eventType);
    eventBroadcast(selectAll(this.children), eventType);
  });
}
