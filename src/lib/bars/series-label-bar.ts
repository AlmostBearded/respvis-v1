import { select, Selection } from 'd3-selection';
import { arrayIs, debug, nodeToString, Position, rectPosition } from '../core';
import { Bar } from './series-bar';
import { HorizontalPosition, Label, seriesLabelJoin, VerticalPosition } from './series-label';

export interface SeriesLabelBar {
  barContainer: Selection<Element>;
  labels: string[] | ((bar: Bar) => string);
  positions: Position | Position[] | ((bar: Bar) => Position);
  offsets: number | Position | Position[] | ((bar: Bar) => Position);
  horizontalPositions?: HorizontalPosition | HorizontalPosition[];
  verticalPositions?: VerticalPosition | VerticalPosition[];
}

export function seriesLabelBarData(data: Partial<SeriesLabelBar>): SeriesLabelBar {
  return {
    barContainer: data.barContainer || select('.chart'),
    labels: data.labels || ((bar) => bar.value.toString()),
    positions: data.positions || { x: 0.5, y: 0.5 },
    offsets: data.offsets || 3,
  };
}

export function seriesLabelBarCreateLabels(seriesData: SeriesLabelBar): Label[] {
  const { barContainer, labels, positions, offsets, horizontalPositions, verticalPositions } =
    seriesData;
  return barContainer
    .selectAll<SVGRectElement, Bar>('.bar:not(.exiting)')
    .data()
    .map((bar, i): Label => {
      const position =
        positions instanceof Function
          ? positions(bar)
          : arrayIs(positions)
          ? positions[i]
          : positions;
      const offset =
        typeof offsets === 'number'
          ? {
              x: (position.x < 0.5 ? -1 : position.x === 0.5 ? 0 : 1) * offsets,
              y: (position.y < 0.5 ? -1 : position.y === 0.5 ? 0 : 1) * offsets,
            }
          : offsets instanceof Function
          ? offsets(bar)
          : arrayIs(offsets)
          ? offsets[i]
          : offsets;
      const p = rectPosition(bar, position);
      return {
        x: p.x + offset.x,
        y: p.y + offset.y,
        text: labels instanceof Function ? labels(bar) : labels[i],
        key: bar.key,
        horizontalPosition: arrayIs(horizontalPositions)
          ? horizontalPositions[i]
          : horizontalPositions !== undefined
          ? horizontalPositions
          : position.x < 0.5
          ? HorizontalPosition.Left
          : position.x === 0.5
          ? HorizontalPosition.Center
          : HorizontalPosition.Right,

        verticalPosition: arrayIs(verticalPositions)
          ? verticalPositions[i]
          : verticalPositions !== undefined
          ? verticalPositions
          : position.y < 0.5
          ? VerticalPosition.Top
          : position.y === 0.5
          ? VerticalPosition.Center
          : VerticalPosition.Bottom,
      };
    });
}

export function seriesLabelBar(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .classed('series-label', true)
    .classed('series-label-bar', true)
    .attr('ignore-layout-children', true)
    .on('datachange.serieslabelbar', function () {
      debug(`data change on ${nodeToString(this)}`);
      select(this).dispatch('render');
    })
    .on('render.serieslabelbar', function (e, d) {
      debug(`render bar label series on ${nodeToString(this)}`);
      const series = select<Element, SeriesLabelBar>(this);
      series
        .selectAll<SVGTextElement, Label>('text')
        .data(seriesLabelBarCreateLabels(d), (d) => d.key)
        .call((s) => seriesLabelJoin(series, s));
    });
}
