import { select, Selection } from 'd3-selection';
import { JoinDecorator, JoinEvent } from '.';
import {
  arrayIs,
  debug,
  nodeToString,
  Position,
  rectPosition,
  classOneOfEnum,
  HorizontalPosition,
  VerticalPosition,
} from '../core';
import { BarData } from './series-bar';
import { LabelData, labelJoin } from './series-label';

export interface LabelBarData extends LabelData {
  bar: Selection<SVGRectElement, BarData>;
  relativePosition: Position;
  offset: Position;
}

export interface SeriesLabelBarData {
  barContainer: Selection<Element>;
  labels: string[] | ((bar: BarData) => string);
  relativePositions: Position | Position[] | ((bar: BarData) => Position);
  offsets: number | Position | Position[] | ((bar: BarData) => Position);
  joinDecorator: JoinDecorator<Element, LabelBarData>;
}

export function seriesLabelBarData(data: Partial<SeriesLabelBarData>): SeriesLabelBarData {
  return {
    barContainer: data.barContainer || select('.chart'),
    labels: data.labels || ((bar) => bar.value.toString()),
    relativePositions: data.relativePositions || { x: 0.5, y: 0.5 },
    offsets: data.offsets || 3,
    joinDecorator: data.joinDecorator ?? {},
  };
}

function seriesLabelBarToLabels({
  barContainer,
  labels,
  relativePositions,
  offsets,
}: SeriesLabelBarData): LabelBarData[] {
  return barContainer
    .selectAll<SVGRectElement, BarData>('.bar:not(.exiting)')
    .nodes()
    .map((barNode, i): LabelBarData => {
      const barS = select<SVGRectElement, BarData>(barNode);
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

export function seriesLabelBarJoin(
  selection: Selection<Element, SeriesLabelBarData>,
  joinDecorator?: JoinDecorator<Element, SeriesLabelBarData>
): void {
  const enterAndUpdate = (selection: Selection<Element, SeriesLabelBarData>) =>
    selection.each(function (d) {
      debug(`render bar label series on ${nodeToString(this)}`);
      const seriesS = select(this);
      seriesS
        .on('update.serieslabelbar', function (e: JoinEvent<Element, LabelBarData>) {
          e.detail.selection;
        })
        .selectAll<SVGTextElement, LabelBarData>('text')
        .data(seriesLabelBarToLabels(d), (d) => d.key)
        .call((s) =>
          labelJoin(s, {
            enter: (s) => d.joinDecorator.enter?.(s),
            update: (s) =>
              s
                .each(function (d) {
                  const labelS = select(this);
                  const { relativePosition: relPos } = d;
                  const HP = HorizontalPosition;
                  const VP = VerticalPosition;
                  const hPos = relPos.x < 0.5 ? HP.Left : relPos.x === 0.5 ? HP.Center : HP.Right;
                  const vPos = relPos.y < 0.5 ? VP.Top : relPos.y === 0.5 ? VP.Center : VP.Bottom;
                  classOneOfEnum(labelS, HP, hPos);
                  classOneOfEnum(labelS, VP, vPos);
                })
                .call((s) => d.joinDecorator.update?.(s)),
                exit: s => 
          })
        );
    });
  // selection.join((enter) =>
  //   enter
  //     .append('g')
  //     .classed('series-label', true)
  //     .classed('series-label-bar', true)
  //     .attr('ignore-layout-children', true),
  //     update =>
  // );

  // selection;
}
