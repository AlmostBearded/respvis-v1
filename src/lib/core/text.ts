import { BaseType, Selection } from 'd3-selection';

export function makeHorizontalText<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .attr('grid-height', 'fit')
    .attr('grid-width', 'fit')
    .attr('dy', '0.71em')
    .attr('text-anchor', 'start');
}

export function makeVerticalText<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .attr('grid-height', 'fit')
    .attr('grid-width', 'fit')
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)');
}
