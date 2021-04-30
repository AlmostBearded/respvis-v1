import { BaseType, Selection } from 'd3-selection';

export function horizontalTextAttrs<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .attr('grid-height', 'fit')
    .attr('grid-width', 'fit')
    .attr('dy', '0.71em')
    .attr('text-anchor', 'start');
}

export function verticalTextAttrs<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .attr('grid-height', 'fit')
    .attr('grid-width', 'fit')
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)');
}

export function titleAttrs<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('title', true)
    .attr('font-size', '1.5em')
    .attr('letter-spacing', '0.15em');
}
