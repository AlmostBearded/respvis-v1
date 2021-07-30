import { BaseType, select, Selection } from 'd3-selection';
import {
  debug,
  nodeToString,
  Position,
  Rect,
  rectCenter,
  rectLeft,
  rectRight,
  rectTop,
} from '../core';
import { Bar } from './series-bar';
import { Label, seriesLabelAttrs, seriesLabelCreateLabels, seriesLabelJoin } from './series-label';

export interface SeriesLabelBar {
  barContainer: Selection<Element>;
  rectPositioner: (rect: Rect) => Position;
  labels: string[] | ((bar: Bar) => string);
}

export function seriesLabelBarData(data: Partial<SeriesLabelBar>): SeriesLabelBar {
  return {
    barContainer: data.barContainer || select('.chart'),
    labels: data.labels || ((bar) => bar.value.toString()),
    rectPositioner: rectCenter,
  };
}

export function seriesLabelBarCreateLabels(seriesData: SeriesLabelBar): Label[] {
  const { barContainer, rectPositioner, labels } = seriesData;
  return barContainer
    .selectAll<SVGRectElement, Bar>('.bar:not(.exiting)')
    .data()
    .map(
      (barData, i): Label => ({
        ...rectPositioner(barData),
        text: labels instanceof Function ? labels(barData) : labels[i],
        key: barData.key,
      })
    );
}

export function seriesLabelBar(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .classed('series-label-bar', true)
    .call((s) => seriesLabelAttrs(s))
    .on(
      'render.serieslabelbar-initial',
      function () {
        debug(`render on data change on ${nodeToString(this)}`);
        select(this).on('datachange.serieslabelbar', function () {
          debug(`data change on ${nodeToString(this)}`);
          select(this).dispatch('render');
        });
      },
      { once: true }
    )
    .on('render.serieslabelbar', function (e, d) {
      debug(`render bar label series on ${nodeToString(this)}`);
      const series = select<Element, SeriesLabelBar>(this);
      series
        .selectAll<SVGTextElement, Label>('text')
        .data(seriesLabelBarCreateLabels(d), (d) => d.key)
        .call((s) => seriesLabelJoin(series, s));
    });
}

export function seriesLabelBarCenterConfig(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .attr('text-anchor', 'center')
    .attr('dominant-baseline', 'middle')
    .datum((d) => {
      d.rectPositioner = rectCenter;
      return d;
    });
}

export function seriesLabelBarLeftConfig(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .layout('margin', '0 0 0 0.25em')
    .datum((d) => {
      d.rectPositioner = rectLeft;
      return d;
    });
}

export function seriesLabelBarRightConfig(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .layout('margin', '0 0 0 0.25em')
    .datum((d) => {
      d.rectPositioner = rectRight;
      return d;
    });
}

export function seriesLabelBarTopConfig(selection: Selection<Element, SeriesLabelBar>): void {
  selection
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'auto')
    .layout('margin', '-0.25em 0 0 0')
    .datum((d) => {
      d.rectPositioner = rectTop;
      return d;
    });
}
