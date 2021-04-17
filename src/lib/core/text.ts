import { BaseType, select, Selection } from 'd3-selection';
import { layoutAsTransformAttr } from './chart';

export function appendText<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return initText(selection.append('text'));
}

export function initText<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .layout('height', 'min-content')
    .layout('width', 'min-content')
    .call(horizontalTextAttrs)
    .on('afterrender.layout', function () {
      select(this).call(layoutAsTransformAttr);
    });
}

export function horizontalTextAttrs(
  selection: Selection<SVGTextElement, any, BaseType, any>
): void {
  selection.attr('dy', '0.71em').attr('text-anchor', 'start');
}

export function verticalTextAttrs(selection: Selection<SVGTextElement, any, BaseType, any>): void {
  selection.attr('transform', 'rotate(-90)').attr('text-anchor', 'end');
}
