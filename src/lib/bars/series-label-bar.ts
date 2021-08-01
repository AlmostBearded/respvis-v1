import { BaseType, select, Selection } from 'd3-selection';
import {
  arrayIs,
  debug,
  nodeToString,
  Position,
  Rect,
  rectCenter,
  rectLeft,
  rectPosition,
  rectRight,
  rectTop,
} from '../core';
import { Bar } from './series-bar';
import { Label, seriesLabelAttrs, seriesLabelCreateLabels, seriesLabelJoin } from './series-label';

export interface SeriesLabelBar {
  barContainer: Selection<Element>;
  labels: string[] | ((bar: Bar) => string);
  positions: Position | Position[] | ((bar: Bar) => Position);
  offsets: number | Position | Position[] | ((bar: Bar) => Position);
  textAnchors?: string | string[] | ((bar: Bar) => string);
  dominantBaselines?: string | string[] | ((bar: Bar) => string);
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
  const { barContainer, labels, positions, offsets, textAnchors, dominantBaselines } = seriesData;
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
        textAnchor:
          textAnchors instanceof Function
            ? textAnchors(bar)
            : arrayIs(textAnchors)
            ? textAnchors[i]
            : textAnchors !== undefined
            ? textAnchors
            : position.x < 0.5
            ? 'end'
            : position.x === 0.5
            ? 'middle'
            : 'start',
        dominantBaseline:
          dominantBaselines instanceof Function
            ? dominantBaselines(bar)
            : arrayIs(dominantBaselines)
            ? dominantBaselines[i]
            : dominantBaselines !== undefined
            ? dominantBaselines
            : position.y < 0.5
            ? 'auto'
            : position.y === 0.5
            ? 'middle'
            : 'hanging',
      };
    });
}

export function seriesLabelBar(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .classed('series-label-bar', true)
    .call((s) => seriesLabelAttrs(s))
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
