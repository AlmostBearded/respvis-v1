import { easeCubicOut } from 'd3-ease';
import { BaseType, select, Selection, ValueFn } from 'd3-selection';
import {
  debug,
  findByFilter,
  findByIndex,
  findByKey,
  nodeToString,
  Position,
  positionToTransformAttr,
} from '../core';

export interface DataLabel extends Position {
  text: string;
  // todo: add index property?
  key: string;
}

export interface DataSeriesLabel {
  texts: string[];
  positions: Position[];
  keys: string[];
}

export function dataSeriesLabel(data: Partial<DataSeriesLabel>): DataSeriesLabel {
  return {
    texts: data.texts || [],
    positions: data.positions || [],
    keys: data.keys || data.texts || [],
  };
}

export function seriesLabelCreateLabels(seriesData: DataSeriesLabel): DataLabel[] {
  const { texts, keys, positions } = seriesData;
  return texts.map((text, i) => ({
    text: text,
    key: keys[i],
    ...positions[i],
  }));
}

export function seriesLabel(selection: Selection<Element, DataSeriesLabel>): void {
  selection
    .classed('series-label', true)
    .call((s) => seriesLabelAttrs(s))
    .on(
      'render.serieslabel-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.serieslabel', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    )
    .on('render.serieslabel', function (e, d) {
      debug(`render label series on ${nodeToString(this)}`);
      const series = select<Element, DataSeriesLabel>(this);
      series
        .selectAll<SVGTextElement, DataLabel>('text')
        .data(seriesLabelCreateLabels(d), (d) => d.key)
        .call((s) => seriesLabelJoin(series, s));
    });
}

export function seriesLabelAttrs(seriesSelection: Selection<Element>): void {
  seriesSelection
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '0.7em');
}

export function seriesLabelJoin(
  seriesSelection: Selection,
  joinSelection: Selection<Element, DataLabel>
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

export function labelHighlight(label: Selection, highlight: boolean): void {
  if (highlight) label.attr('font-size', '1.2em').attr('text-decoration', 'underline');
  else label.attr('font-size', null).attr('text-decoration', null);
}

export function labelFind(container: Selection, key: string): Selection<SVGTextElement, DataLabel> {
  return findByKey<SVGTextElement, DataLabel>(container, '.label', key);
}

export function labelFindByIndex(
  container: Selection,
  index: number
): Selection<SVGTextElement, DataLabel> {
  return findByIndex<SVGTextElement, DataLabel>(container, '.label', index);
}

export function labelFindByFilter(
  container: Selection,
  filter: ValueFn<SVGTextElement, DataLabel, boolean>
): Selection<SVGTextElement, DataLabel> {
  return findByFilter<SVGTextElement, DataLabel>(container, '.label', filter);
}
