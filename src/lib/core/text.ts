import { BaseType, Selection } from 'd3-selection';

export function textHorizontalAttrs<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .layout('height', 'fit')
    .layout('width', 'fit')
    .attr('dominant-baseline', 'hanging')
    .attr('text-anchor', 'start')
    .attr('writing-mode', 'horizontal-tb');
}

export function textVerticalAttrs<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .layout('height', 'fit')
    .layout('width', 'fit')
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'ideographic')
    .attr('writing-mode', 'vertical-lr');
}

export function textTitleAttrs<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('title', true)
    .attr('font-size', '1.5em')
    .attr('letter-spacing', '0.15em');
}
