import { BaseType, Selection } from 'd3';

export function chartRender<
  GElement extends SVGSVGElement | SVGGElement,
  Datum,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('chart', true)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
}
