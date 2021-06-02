import { BaseType, select, Selection } from 'd3-selection';
import { Position, Rect, rectCenter, rectLeft, rectTop } from '../core';
import { DataBar } from './series-bar';
import { DataLabel, dataSeriesLabel, DataSeriesLabel } from './series-label';

export interface DataLabelsBarCreation {
  barContainer: Selection<Element>;
  positionFromRect: (rect: Rect) => Position;
  labels: (string | number)[];
}

export interface DataSeriesLabelBar extends DataSeriesLabel {
  creation: DataLabelsBarCreation;
}

export function dataLabelsBarCreation(
  data?: Partial<DataLabelsBarCreation>
): DataLabelsBarCreation {
  return {
    barContainer: data?.barContainer || select('.chart'),
    labels: data?.labels || [],
    positionFromRect: rectCenter,
  };
}

export function dataSeriesLabelBar(creationData: DataLabelsBarCreation): DataSeriesLabelBar {
  const seriesData: DataSeriesLabelBar = {
    ...dataSeriesLabel({ data: () => dataLabelsBar(seriesData.creation) }),
    creation: creationData,
  };
  return seriesData;
}

export function dataLabelsBar(data: DataLabelsBarCreation): DataLabel[] {
  return data.barContainer
    .selectAll<SVGRectElement, DataBar>('.bar')
    .data()
    .map((barData, i) => ({
      ...data.positionFromRect(barData),
      text: data.labels[i],
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
      d.creation.positionFromRect = rectCenter;
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
    .layout('margin', '0 0 0 5px')
    .datum((d) => {
      d.creation.positionFromRect = rectLeft;
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
    .layout('margin', '-5px 0 0 0')
    .datum((d) => {
      d.creation.positionFromRect = rectTop;
      return d;
    });
}
