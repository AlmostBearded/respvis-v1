import { easeCubicOut } from 'd3-ease';
import { select, Selection, ValueFn } from 'd3-selection';
import { JoinDecorator } from '.';
import { findByFilter, findByIndex, findByKey, Position, positionToTransformAttr } from '../core';

export interface SeriesLabelData {
  texts: string[];
  positions: Position[];
  keys: string[];
  joinDecorator: JoinDecorator<SVGTextElement, LabelData>;
}

export function seriesLabelData(data: Partial<SeriesLabelData>): SeriesLabelData {
  const texts = data.texts ?? [];
  const positions = data.positions ?? [];
  const keys = data.keys ?? texts.map((t, i) => i.toString());
  const joinDecorator = data.joinDecorator ?? {};
  return { texts, positions, keys, joinDecorator };
}

function seriesLabelToLabels({ texts, keys, positions }: SeriesLabelData): LabelData[] {
  return texts.map((text, i) => ({
    text: text,
    key: keys[i],
    ...positions[i],
  }));
}

export function seriesLabelJoin(
  selection: Selection<Element, SeriesLabelData>,
  joinDecorator?: JoinDecorator<Element, SeriesLabelData>
): void {
  const enterAndUpdate = (selection: Selection<Element, SeriesLabelData>) =>
    selection.each(function (d) {
      const seriesS = select(this);
      seriesS
        .selectAll<SVGTextElement, LabelData>('text')
        .data(seriesLabelToLabels(d), (d) => d.key)
        .call((s) => labelJoin(s, d.joinDecorator));
    });
  selection
    .join(
      (enter) =>
        enter
          .append('g')
          .classed('series-label', true)
          .attr('ignore-layout-children', true)
          .call((s) => enterAndUpdate(s))
          .call((s) => joinDecorator?.enter?.(s)),
      (update) => update.call((s) => enterAndUpdate(s)).call((s) => joinDecorator?.update?.(s)),
      (exit) => exit.classed('exiting', true).remove()
    )
    .call((s) => joinDecorator?.merge?.(s));
}

export interface LabelData extends Position {
  text: string;
  key: string;
}

export function labelJoin<Data extends LabelData>(
  selection: Selection<SVGTextElement, Data>,
  joinDecorator?: JoinDecorator<SVGTextElement, Data>
): void {
  selection
    .join(
      (enter) =>
        enter
          .append('text')
          .classed('label', true)
          .each(function (d) {
            select(this).call((s) => positionToTransformAttr(s, d));
          })
          .attr('font-size', '0em')
          .attr('opacity', 0)
          .call((s) =>
            s.transition('enter').duration(250).attr('font-size', '1em').attr('opacity', 1)
          )
          .call((s) => joinDecorator?.enter?.(s)),
      (update) => update.call((s) => joinDecorator?.update?.(s)),
      (exit) =>
        exit
          .classed('exiting', true)
          .call((s) =>
            s.transition('exit').duration(250).attr('font-size', '0em').attr('opacity', 0).remove()
          )
          .call((s) => joinDecorator?.exit?.(s))
    )
    .each(function (d) {
      select(this)
        .transition('position')
        .duration(250)
        .ease(easeCubicOut)
        .call((t) => positionToTransformAttr(t, d));
    })
    .text((d) => d.text)
    .call((s) => joinDecorator?.merge?.(s));
}

export function labelFind(container: Selection, key: string): Selection<SVGTextElement, LabelData> {
  return findByKey<SVGTextElement, LabelData>(container, '.label', key);
}

export function labelFindByIndex(
  container: Selection,
  index: number
): Selection<SVGTextElement, LabelData> {
  return findByIndex<SVGTextElement, LabelData>(container, '.label', index);
}

export function labelFindByFilter(
  container: Selection,
  filter: ValueFn<SVGTextElement, LabelData, boolean>
): Selection<SVGTextElement, LabelData> {
  return findByFilter<SVGTextElement, LabelData>(container, '.label', filter);
}
