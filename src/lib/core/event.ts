import { BaseType, selectAll, Selection } from 'd3-selection';

export function eventBroadcast<GElement extends Element, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>,
  eventType: string
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.dispatch(eventType).each(function () {
    eventBroadcast(selectAll(this.children), eventType);
  });
}
