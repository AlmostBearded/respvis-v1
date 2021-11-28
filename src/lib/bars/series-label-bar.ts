import { select, Selection } from 'd3-selection';
import { JoinEvent } from '.';
import {
  arrayIs,
  debug,
  nodeToString,
  Position,
  rectPosition,
  HorizontalPosition,
  VerticalPosition,
} from '../core';
import { Bar } from './series-bar';
import { Label, seriesLabelJoin } from './series-label';

export interface LabelBar extends Label {
  bar: Selection<SVGRectElement, Bar>;
  relativePosition: Position;
  offset: Position;
}

export interface SeriesLabelBar {
  barContainer: Selection<Element>;
  labels: string[] | ((bar: Bar) => string);
  relativePositions: Position | Position[] | ((bar: Bar) => Position);
  offsets: number | Position | Position[] | ((bar: Bar) => Position);
}

export function seriesLabelBarData(data: Partial<SeriesLabelBar>): SeriesLabelBar {
  return {
    barContainer: data.barContainer || select('.chart'),
    labels: data.labels || ((bar) => bar.value.toString()),
    relativePositions: data.relativePositions || { x: 0.5, y: 0.5 },
    offsets: data.offsets || 3,
  };
}

export function seriesLabelBarCreateLabels(seriesData: SeriesLabelBar): LabelBar[] {
  const { barContainer, labels, relativePositions, offsets } = seriesData;
  return barContainer
    .selectAll<SVGRectElement, Bar>('.bar:not(.exiting)')
    .nodes()
    .map((barNode, i): LabelBar => {
      const barS = select<SVGRectElement, Bar>(barNode);
      const barD = barS.datum();
      const relativePosition =
        relativePositions instanceof Function
          ? relativePositions(barD)
          : arrayIs(relativePositions)
          ? relativePositions[i]
          : relativePositions;
      const offset =
        typeof offsets === 'number'
          ? {
              x: (relativePosition.x < 0.5 ? -1 : relativePosition.x === 0.5 ? 0 : 1) * offsets,
              y: (relativePosition.y < 0.5 ? -1 : relativePosition.y === 0.5 ? 0 : 1) * offsets,
            }
          : offsets instanceof Function
          ? offsets(barD)
          : arrayIs(offsets)
          ? offsets[i]
          : offsets;
      const position = rectPosition(barD, relativePosition);

      return {
        x: position.x + offset.x,
        y: position.y + offset.y,
        relativePosition: relativePosition,
        offset: offset,
        text: labels instanceof Function ? labels(barD) : labels[i],
        bar: barS,
        key: barD.key,
      };
    });
}

export function seriesLabelBar(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .classed('series-label', true)
    .classed('series-label-bar', true)
    .attr('data-ignore-layout-children', true)
    .each((d, i, g) => {
      const seriesS = select<Element, SeriesLabelBar>(g[i]);
      seriesS
        .on('update.serieslabelbar', function (e: JoinEvent<Element, LabelBar>) {
          e.detail.selection.each((d, i, g) => {
            const s = select(g[i]);
            const { relativePosition: relPos } = d;
            const HP = HorizontalPosition;
            const VP = VerticalPosition;
            const hPos = relPos.x < 0.5 ? HP.Left : relPos.x === 0.5 ? HP.Center : HP.Right;
            const vPos = relPos.y < 0.5 ? VP.Top : relPos.y === 0.5 ? VP.Center : VP.Bottom;
            s.attr('data-align-h', hPos).attr('data-align-v', vPos);
          });
        })
        .selectAll<SVGTextElement, Label>('text')
        .data(seriesLabelBarCreateLabels(d), (d) => d.key)
        .call((s) => seriesLabelJoin(seriesS, s));
    });
}
