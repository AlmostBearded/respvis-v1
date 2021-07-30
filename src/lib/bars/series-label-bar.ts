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
import { DataBar } from './series-bar';
import {
  DataLabel,
  seriesLabelAttrs,
  seriesLabelCreateLabels,
  seriesLabelJoin,
} from './series-label';

export interface DataSeriesLabelBar {
  barContainer: Selection<Element>;
  rectPositioner: (rect: Rect) => Position;
  labels: string[] | ((bar: DataBar) => string);
}

export function dataSeriesLabelBar(data: Partial<DataSeriesLabelBar>): DataSeriesLabelBar {
  return {
    barContainer: data.barContainer || select('.chart'),
    labels: data.labels || ((bar) => bar.value.toString()),
    rectPositioner: rectCenter,
  };
}

export function seriesLabelBarCreateLabels(seriesData: DataSeriesLabelBar): DataLabel[] {
  const { barContainer, rectPositioner, labels } = seriesData;
  return barContainer
    .selectAll<SVGRectElement, DataBar>('.bar:not(.exiting)')
    .data()
    .map(
      (barData, i): DataLabel => ({
        ...rectPositioner(barData),
        text: labels instanceof Function ? labels(barData) : labels[i],
        key: barData.key,
      })
    );
}

export function seriesLabelBar(selection: Selection<Element, DataSeriesLabelBar>): void {
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
      const series = select<Element, DataSeriesLabelBar>(this);
      series
        .selectAll<SVGTextElement, DataLabel>('text')
        .data(seriesLabelBarCreateLabels(d), (d) => d.key)
        .call((s) => seriesLabelJoin(series, s));
    });
}

export function seriesLabelBarCenterConfig(
  selection: Selection<Element, DataSeriesLabelBar>
): void {
  selection
    .attr('text-anchor', 'center')
    .attr('dominant-baseline', 'middle')
    .datum((d) => {
      d.rectPositioner = rectCenter;
      return d;
    });
}

export function seriesLabelBarLeftConfig(selection: Selection<Element, DataSeriesLabelBar>): void {
  selection
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .layout('margin', '0 0 0 0.25em')
    .datum((d) => {
      d.rectPositioner = rectLeft;
      return d;
    });
}

export function seriesLabelBarRightConfig(selection: Selection<Element, DataSeriesLabelBar>): void {
  selection
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .layout('margin', '0 0 0 0.25em')
    .datum((d) => {
      d.rectPositioner = rectRight;
      return d;
    });
}

export function seriesLabelBarTopConfig(selection: Selection<Element, DataSeriesLabelBar>): void {
  selection
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'auto')
    .layout('margin', '-0.25em 0 0 0')
    .datum((d) => {
      d.rectPositioner = rectTop;
      return d;
    });
}
