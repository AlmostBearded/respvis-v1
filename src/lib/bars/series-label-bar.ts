import { BaseType, select, Selection } from 'd3-selection';
import {
  DataSeriesGenerator,
  Position,
  Rect,
  rectCenter,
  rectLeft,
  rectRight,
  rectTop,
} from '../core';
import { DataBar } from './series-bar';
import { DataLabel } from './series-label';

export interface DataSeriesLabelBar extends DataSeriesGenerator<DataLabel> {
  barContainer: Selection<Element>;
  rectPositioner: (rect: Rect) => Position;
  labels: (string | number)[];
}

export function dataSeriesLabelBar(data: Partial<DataSeriesLabelBar>): DataSeriesLabelBar {
  return {
    barContainer: data.barContainer || select('.chart'),
    labels: data.labels || [],
    rectPositioner: rectCenter,
    dataGenerator: data.dataGenerator || dataLabelBarGenerator,
  };
}

export function dataLabelBarGenerator(
  selection: Selection<Element, DataSeriesLabelBar>
): DataLabel[] {
  const seriesDatum = selection.datum();
  return seriesDatum.barContainer
    .selectAll<SVGRectElement, DataBar>('.bar:not(.exiting)')
    .data()
    .map((barData, i) => ({
      ...seriesDatum.rectPositioner(barData),
      text: seriesDatum.labels[i],
      key: barData.key,
    }));
}

export function seriesLabelBarCenterConfig<
  GElement extends Element,
  Datum extends DataSeriesLabelBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .attr('text-anchor', 'center')
    .attr('dominant-baseline', 'middle')
    .datum((d) => {
      d.rectPositioner = rectCenter;
      return d;
    });
}

export function seriesLabelBarLeftConfig<
  GElement extends Element,
  Datum extends DataSeriesLabelBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .layout('margin', '0 0 0 0.25em')
    .datum((d) => {
      d.rectPositioner = rectLeft;
      return d;
    });
}

export function seriesLabelBarRightConfig<
  GElement extends Element,
  Datum extends DataSeriesLabelBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle')
    .layout('margin', '0 0 0 0.25em')
    .datum((d) => {
      d.rectPositioner = rectRight;
      return d;
    });
}

export function seriesLabelBarTopConfig<
  GElement extends Element,
  Datum extends DataSeriesLabelBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'auto')
    .layout('margin', '-0.25em 0 0 0')
    .datum((d) => {
      d.rectPositioner = rectTop;
      return d;
    });
}
