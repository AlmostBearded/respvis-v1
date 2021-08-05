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

export interface Label extends Position {
  text: string;
  horizontalPosition: HorizontalPosition;
  verticalPosition: VerticalPosition;
  key: string;
}

export interface SeriesLabel {
  texts: string[];
  positions: Position[];
  horizontalPositions: HorizontalPosition | HorizontalPosition[];
  verticalPositions: VerticalPosition | VerticalPosition[];
  keys: string[];
}

export function seriesLabelData(data: Partial<SeriesLabel>): SeriesLabel {
  return {
    texts: data.texts || [],
    positions: data.positions || [],
    horizontalPositions: data.horizontalPositions || HorizontalPosition.Center,
    verticalPositions: data.verticalPositions || VerticalPosition.Center,
    keys: data.keys || data.texts || [],
  };
}

export function seriesLabelCreateLabels(seriesData: SeriesLabel): Label[] {
  const { texts, keys, positions, horizontalPositions, verticalPositions } = seriesData;
  return texts.map((text, i) => ({
    text: text,
    horizontalPosition: arrayIs(horizontalPositions) ? horizontalPositions[i] : horizontalPositions,
    verticalPosition: arrayIs(verticalPositions) ? verticalPositions[i] : verticalPositions,
    key: keys[i],
    ...positions[i],
  }));
}

export function seriesLabel(selection: Selection<Element, SeriesLabel>): void {
  selection
    .classed('series-label', true)
    .attr('ignore-layout-children', true)
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
    .each((d, i, g) =>
      Object.values(HorizontalPosition).forEach((v) =>
        g[i].classList.toggle(v, v === d.horizontalPosition)
      )
    )
    .each((d, i, g) =>
      Object.values(VerticalPosition).forEach((v) =>
        g[i].classList.toggle(v, v === d.verticalPosition)
      )
    )
    .each((d, i, g) =>
      Object.values(VerticalPosition).forEach((v) =>
        g[i].classList.toggle('center', v === d.verticalPosition)
      )
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
