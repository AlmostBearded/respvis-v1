import { easeCubicOut } from 'd3-ease';
import { BaseType, select, Selection, ValueFn } from 'd3-selection';
import {
  arrayIs,
  debug,
  findByFilter,
  findByIndex,
  findByKey,
  nodeToString,
  Position,
  positionToTransformAttr,
} from '../core';

export interface Label extends Position {
  textAnchor: string;
  dominantBaseline: string;
  text: string;
  key: string;
}

export interface SeriesLabel {
  texts: string[];
  positions: Position[];
  textAnchors: string | string[];
  dominantBaselines: string | string[];
  keys: string[];
}

export function seriesLabelData(data: Partial<SeriesLabel>): SeriesLabel {
  return {
    texts: data.texts || [],
    positions: data.positions || [],
    keys: data.keys || data.texts || [],
    textAnchors: data.textAnchors || 'middle',
    dominantBaselines: data.dominantBaselines || 'middle',
  };
}

export function seriesLabelCreateLabels(seriesData: SeriesLabel): Label[] {
  const { texts, keys, positions, textAnchors, dominantBaselines } = seriesData;
  return texts.map((text, i) => ({
    text: text,
    key: keys[i],
    textAnchor: arrayIs(textAnchors) ? textAnchors[i] : textAnchors,
    dominantBaseline: arrayIs(dominantBaselines) ? dominantBaselines[i] : dominantBaselines,
    ...positions[i],
  }));
}

export function seriesLabel(selection: Selection<Element, SeriesLabel>): void {
  selection
    .classed('series-label', true)
    .call((s) => seriesLabelAttrs(s))
    .on('datachange.serieslabel', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.serieslabel', function (e, d) {
      debug(`render label series on ${nodeToString(this)}`);
      const series = select<Element, SeriesLabel>(this);
      series
        .selectAll<SVGTextElement, Label>('text')
        .data(seriesLabelCreateLabels(d), (d) => d.key)
        .call((s) => seriesLabelJoin(series, s));
    });
}

export function seriesLabelAttrs(seriesSelection: Selection<Element>): void {
  seriesSelection.attr('font-size', '0.7em');
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
    .attr('text-anchor', (d) => d.textAnchor)
    .attr('dominant-baseline', (d) => d.dominantBaseline)
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

export function labelHighlight(label: Selection, highlight: boolean): void {
  if (highlight) label.attr('font-size', '1.2em').attr('text-decoration', 'underline');
  else label.attr('font-size', null).attr('text-decoration', null);
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
