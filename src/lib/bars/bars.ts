import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, select, Selection, ValueFn } from 'd3-selection';
import { Transition } from 'd3-transition';
import { COLORS_CATEGORICAL, SelectionOrTransition } from '../core';
import { Rect } from '../core/rect';
import { Size } from '../core/utils';

export enum Orientation {
  Vertical,
  Horizontal,
}

export interface DataBar extends Rect<number> {
  mainIndex: number;
  key: string;
}

export interface DataSeriesBar {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  crossValues: any[];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys?: string[];
  orientation: Orientation;
  join?: DataBarsJoin;
}

export const COLOR_BAR = COLORS_CATEGORICAL[0];

export function seriesBar<
  GElement extends BaseType,
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
  GElement extends BaseType,
  Datum extends DataSeriesBar,
  PElement extends BaseType,
  PDatum
>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum, PElement, PDatum> {
  return selection.each((d, i, g) =>
    select(g[i])
      .selectAll<SVGRectElement, DataBar>('rect')
      .data(dataBars(d, selection.layout()), (d) => d.key)
      .call((s) => joinBars(s, d.join))
  );
}

export function dataSeriesBar(data?: Partial<DataSeriesBar>): DataSeriesBar {
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

export function dataBars(seriesData: DataSeriesBar, bounds: Size): DataBar[] {
  if (seriesData.orientation === Orientation.Vertical) {
    seriesData.mainScale.range([0, bounds.width]);
    seriesData.crossScale.range([bounds.height, 0]);
  } else if (seriesData.orientation === Orientation.Horizontal) {
    seriesData.mainScale.range([0, bounds.height]);
    seriesData.crossScale.range([0, bounds.width]);
  }

  const data: DataBar[] = [];

  for (let i = 0; i < seriesData.crossValues.length; ++i) {
    const mv = seriesData.mainValues[i];
    const cv = seriesData.crossValues[i];

    if (seriesData.orientation === Orientation.Vertical) {
      data.push({
        mainIndex: i,
        key: seriesData.keys?.[i] || i.toString(),
        x: seriesData.mainScale(mv)!,
        y: Math.min(seriesData.crossScale(0)!, seriesData.crossScale(cv)!),
        width: seriesData.mainScale.bandwidth(),
        height: Math.abs(seriesData.crossScale(0)! - seriesData.crossScale(cv)!),
      });
    } else if (seriesData.orientation === Orientation.Horizontal) {
      data.push({
        mainIndex: i,
        key: seriesData.keys?.[i] || i.toString(),
        x: Math.min(seriesData.crossScale(0)!, seriesData.crossScale(cv)!),
        y: seriesData.mainScale(mv)!,
        width: Math.abs(seriesData.crossScale(0)! - seriesData.crossScale(cv)!),
        height: seriesData.mainScale.bandwidth(),
      });
    }
  }
  return data;
}

export type BarSelection = Selection<SVGRectElement, DataBar>;
export type BarTransition = Transition<SVGRectElement, DataBar>;
export interface DataBarsJoin {
  enter?: (selection: BarSelection) => void;
  update?: (selection: BarSelection) => void;
  updateTransition?: (transition: BarTransition) => void;
  exit?: (selection: BarSelection) => void;
  exitTransition?: (transition: BarTransition) => void;
}

export function joinBars(selection: Selection<SVGRectElement, DataBar>, data?: DataBarsJoin) {
  const enter = selection
    .enter()
    .append('rect')
    .classed('bar', true)
    .call((s) => rectAttrs(s, (d) => minimizeRect(d)))
    .call((s) => data?.enter?.(s));

  selection
    .merge(enter)
    .call((s) => data?.update?.(s))
    .transition()
    .duration(250)
    .call((s) => rectAttrs(s, (d) => d))
    .call((t) => data?.updateTransition?.(t));

  selection
    .exit<DataBar>()
    // todo: class not removed if exit transition cancelled (can this happen?)
    .classed('exiting', true)
    .call((s) => data?.exit?.(s))
    .transition()
    .duration(250)
    .call((s) => rectAttrs(s, (d) => minimizeRect(d)))
    .remove()
    .call((t) => data?.exitTransition?.(t));
}

export function minimizeRect(rect: Rect<number>): Rect<number> {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: 0, height: 0 };
}

export function rectAttrs<D>(
  selection: SelectionOrTransition<SVGElement, D>,
  rect: Rect<number> | ValueFn<SVGElement, D, Rect<number>>
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
