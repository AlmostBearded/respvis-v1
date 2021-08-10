import { BaseType, select, Selection } from 'd3-selection';
import { classOneOfEnum } from './utility/class';

export enum WritingMode {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum VerticalPosition {
  Top = 'top',
  Center = 'center-vertical',
  Bottom = 'bottom',
}

export enum HorizontalPosition {
  Left = 'left',
  Center = 'center-horizontal',
  Right = 'right',
}

export interface Text {
  writingMode: WritingMode;
  horizontalPosition: HorizontalPosition;
  verticalPosition: VerticalPosition;
  title: boolean;
}

export type TextSelection = Selection<Element, Text>;

export function textData(data: Partial<Text>): Text {
  return {
    writingMode: data.writingMode || WritingMode.Horizontal,
    title: data.title || false,
    horizontalPosition: data.horizontalPosition || HorizontalPosition.Right,
    verticalPosition: data.verticalPosition || VerticalPosition.Bottom,
  };
}

export function text(selection: Selection<Element, Text>): void {
  selection
    .classed('text', true)
    .on('datachange.text', function () {
      const s = <TextSelection>select(this);
      const { writingMode, title, horizontalPosition, verticalPosition } = s.datum();
      classOneOfEnum(s, WritingMode, writingMode);
      classOneOfEnum(s, HorizontalPosition, horizontalPosition);
      classOneOfEnum(s, VerticalPosition, verticalPosition);
      s.classed('title', title);
    })
    .dispatch('datachange');
}

export function textHorizontalAttrs<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .layout('--fit-height', 'true')
    .layout('--fit-width', 'true')
    .attr('dominant-baseline', 'hanging')
    .attr('text-anchor', 'start')
    .attr('writing-mode', 'horizontal-tb');
}

export function textVerticalAttrs<Datum, PElement extends BaseType, PDatum>(
  selection: Selection<SVGTextElement, Datum, PElement, PDatum>
): Selection<SVGTextElement, Datum, PElement, PDatum> {
  return selection
    .layout('--fit-height', 'true')
    .layout('--fit-width', 'true')
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
    .attr('letter-spacing', '0.1em');
}
