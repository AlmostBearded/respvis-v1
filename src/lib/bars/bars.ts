import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, Selection, ValueFn } from 'd3-selection';
import { Transition } from 'd3-transition';
import { COLORS_CATEGORICAL, SelectionOrTransition } from '../core';
import { Rect } from '../core/rect';
import { Size } from '../core/utils';
import { BarData } from './bars-component';

export const COLOR_BAR = COLORS_CATEGORICAL[0];

export enum Orientation {
  Vertical,
  Horizontal,
}

export interface DataBar extends Rect<number> {
  index: number;
  key: string;
}

export interface DataBarCreation {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  crossValues: any[];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  orientation: Orientation;
}

export interface DataSeries<Datum> {
  getData: (selection: Selection<Element>) => Datum[];
  getKey: (datum: Datum, index: number) => string | number;
}

export interface DataSeriesBar extends DataSeries<DataBar> {}

export function dataBarCreation(data?: Partial<DataBarCreation>): DataBarCreation {
  return {
    mainValues: data?.mainValues || [],
    mainScale:
      data?.mainScale ||
      scaleBand()
        .domain(data?.mainValues || [])
        .padding(0.1),
    crossValues: data?.crossValues || [],
    crossScale:
      data?.crossScale ||
      scaleLinear()
        .domain([0, Math.max(...(data?.crossValues || []))])
        .nice(),
    orientation: data?.orientation || Orientation.Vertical,
  };
}

export function dataSeries<SeriesDatum>(
  data?: Partial<DataSeries<SeriesDatum>>
): DataSeries<SeriesDatum> {
  return {
    getData: data?.getData || ((s) => []),
    getKey: data?.getKey || ((d, i) => i),
  };
}

export function dataSeriesBar(data?: Partial<DataSeriesBar>): DataSeriesBar {
  return dataSeries({
    getData: data?.getData,
    getKey: data?.getKey || ((d, i) => d.key),
  });
}

export function dataBars(creationData: DataBarCreation, bounds: Size): DataBar[] {
  if (creationData.orientation === Orientation.Vertical) {
    creationData.mainScale.range([0, bounds.width]);
    creationData.crossScale.range([bounds.height, 0]);
  } else if (creationData.orientation === Orientation.Horizontal) {
    creationData.mainScale.range([0, bounds.height]);
    creationData.crossScale.range([0, bounds.width]);
  }

  const data: DataBar[] = [];

  for (let i = 0; i < creationData.crossValues.length; ++i) {
    const mv = creationData.mainValues[i];
    const cv = creationData.crossValues[i];

    if (creationData.orientation === Orientation.Vertical) {
      data.push({
        index: i,
        key: creationData.keys?.[i] || i.toString(),
        x: creationData.mainScale(mv)!,
        y: Math.min(creationData.crossScale(0)!, creationData.crossScale(cv)!),
        width: creationData.mainScale.bandwidth(),
        height: Math.abs(creationData.crossScale(0)! - creationData.crossScale(cv)!),
      });
    } else if (creationData.orientation === Orientation.Horizontal) {
      data.push({
        index: i,
        key: creationData.keys?.[i] || i.toString(),
        x: Math.min(creationData.crossScale(0)!, creationData.crossScale(cv)!),
        y: creationData.mainScale(mv)!,
        width: Math.abs(creationData.crossScale(0)! - creationData.crossScale(cv)!),
        height: creationData.mainScale.bandwidth(),
      });
    }
  }
  return data;
}

export function seriesBar<
  GElement extends Element,
  Datum extends DataSeriesBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection
    .classed('series-bar', true)
    .attr('fill', COLOR_BAR)
    .on('render.seriesbar', function (e, d) {
      renderSeriesBar(select<GElement, DataSeriesBar>(this));
    });
}

export function renderSeriesBar<
  GElement extends Element,
  Datum extends DataSeriesBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) => {
    const series = select(g[i]);
    series
      .selectAll<SVGRectElement, DataBar>('rect')
      .data(d.getData(series), d.getKey)
      .join(
        (enter) =>
          enter
            .append('rect')
            .classed('bar', true)
            .call((s) => rectAttrs(s, (d) => minimizeRect(d)))
            .call((s) => selection.dispatch('joinenter', { detail: { selection: s } })),
        undefined,
        (exit) =>
          exit
            .classed('exiting', true)
            .call((s) => selection.dispatch('joinexit', { detail: { selection: s } }))
            .transition()
            .duration(250)
            .call((t) => rectAttrs(t, (d) => minimizeRect(d)))
            .remove()
            .call((t) => selection.dispatch('joinexittransition', { detail: { transition: t } }))
      )
      .call((s) => selection.dispatch('joinupdate', { detail: { selection: s } }))
      .transition()
      .duration(250)
      .call((t) => rectAttrs(t, (d) => d))
      .call((t) => selection.dispatch('joinupdatetransition', { detail: { transition: t } }));
  });
}

export function minimizeRect(rect: Rect<number>): Rect<number> {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: 0, height: 0 };
}

export function rectAttrs<D>(
  selection: SelectionOrTransition<Element, D>,
  rect: Rect<number> | ValueFn<Element, D, Rect<number>>
): void {
  // todo: comment this function
  const rects: Rect<number>[] = new Array(selection.size());
  selection.each(function (d, i, groups) {
    rects[i] = rect instanceof Function ? rect.call(this, d, i, groups) : rect;
  });
  // note: TS can't handle method chaining when working with SelectionOrTransition
  selection.attr('x', (d, i) => rects[i].x);
  selection.attr('y', (d, i) => rects[i].y);
  selection.attr('width', (d, i) => rects[i].width);
  selection.attr('height', (d, i) => rects[i].height);
}
