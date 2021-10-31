import { easeCubicOut } from 'd3-ease';
import { select, Selection, ValueFn } from 'd3-selection';
import {
  debug,
  findByFilter,
  findByIndex,
  findByKey,
  nodeToString,
  Position,
  positionToTransformAttr,
} from '../core';
import { DataHydrateFn } from '../core/utility/data';

export interface Label extends Position {
  text: string;
  key: string;
}

export interface SeriesLabel {
  texts: string[];
  positions: Position[];
  keys: string[];
}

export function seriesLabelDataHydrate(data: Partial<SeriesLabel>): SeriesLabel {
  return {
    texts: data.texts || [],
    positions: data.positions || [],
    keys: data.keys || data.texts || [],
  };
}

export function seriesLabelCreateLabels(seriesData: SeriesLabel): Label[] {
  const { texts, keys, positions } = seriesData;
  return texts.map((text, i) => ({
    text: text,
    key: keys[i],
    ...positions[i],
  }));
}

export function seriesLabel(
  selection: Selection<Element, Partial<SeriesLabel>>,
  dataHydrate: DataHydrateFn<SeriesLabel> = seriesLabelDataHydrate
): void {
  selection
    .classed('series-label', true)
    .attr('ignore-layout-children', true)
    .each(function (d) {
      const seriesS = select(this);
      const seriesD = dataHydrate(d);
      seriesS
        .selectAll<SVGTextElement, Label>('text')
        .data(seriesLabelCreateLabels(seriesD), (d) => d.key)
        .call((s) => seriesLabelJoin(seriesS, s));
    });
}

export function seriesLabelJoin(
  seriesSelection: Selection,
  joinSelection: Selection<Element, Label>
): void {
  joinSelection
    .join(
      (enter) =>
        enter
          .append('text')
          .classed('label', true)
          .call((s) => positionToTransformAttr(s, (d) => d))
          .attr('font-size', '0em')
          .attr('opacity', 0)
          .call((s) =>
            s.transition('enter').duration(250).attr('font-size', '1em').attr('opacity', 1)
          )
          .call((s) => seriesSelection.dispatch('enter', { detail: { selection: s } })),
      undefined,
      (exit) =>
        exit
          .classed('exiting', true)
          .call((s) =>
            s.transition('exit').duration(250).attr('font-size', '0em').attr('opacity', 0).remove()
          )
          .call((s) => seriesSelection.dispatch('exit', { detail: { selection: s } }))
    )
    .call((s) =>
      s
        .transition('position')
        .duration(250)
        .ease(easeCubicOut)
        .call((t) => positionToTransformAttr(t, (d) => d))
    )
    .text((d) => d.text)
    .call((s) => seriesSelection.dispatch('update', { detail: { selection: s } }));
}

export function labelFind(container: Selection, key: string): Selection<SVGTextElement, Label> {
  return findByKey<SVGTextElement, Label>(container, '.label', key);
}

export function labelFindByIndex(
  container: Selection,
  index: number
): Selection<SVGTextElement, Label> {
  return findByIndex<SVGTextElement, Label>(container, '.label', index);
}

export function labelFindByFilter(
  container: Selection,
  filter: ValueFn<SVGTextElement, Label, boolean>
): Selection<SVGTextElement, Label> {
  return findByFilter<SVGTextElement, Label>(container, '.label', filter);
}
