import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, EnterElement, select, Selection, ValueFn } from 'd3-selection';
import { Transition } from 'd3-transition';
import { COLORS_CATEGORICAL, isTransition, SelectionOrTransition } from '../core';
import { Rect, rectFromString } from '../core/rect';
import { Size } from '../core/utils';

// export enum BarOrientation {
//   Vertical,
//   Horizontal,
// }

// export interface Bars {
//   mainValues(): any[];
//   mainValues(values: any[]): this;
//   mainScale(): ScaleBand<any>;
//   mainScale(scale: ScaleBand<any>): this;
//   crossValues(): any[];
//   crossValues(values: any[]): this;
//   crossScale(): ScaleContinuousNumeric<number, number>;
//   crossScale(scale: ScaleContinuousNumeric<number, number>): this;
//   keys(): string[];
//   keys(keys: null): this;
//   keys(keys: string[]): this;
//   orientation(): BarOrientation;
//   orientation(orientation: BarOrientation): this;
//   barData(): BarData[];
// }

// export interface BarData {
//   mainIndex: number;
//   key: string;
//   rect: Rect<number>;
// }

// export class BarsCalculator implements Bars {
//   private _mainValues: any[];
//   private _mainScale: ScaleBand<any>;
//   private _crossValues: number[];
//   private _crossScale: ScaleContinuousNumeric<number, number>;
//   private _orientation: BarOrientation;
//   private _keys: string[] | undefined;
//   private _bars: BarData[];

//   constructor() {
//     this._mainValues = [];
//     this._mainScale = bandScale();
//     this._crossValues = [];
//     this._crossScale = linearScale();
//     this._orientation = BarOrientation.Vertical;
//     this._bars = [];
//   }

//   mainValues(): any[];
//   mainValues(values: any[]): this;
//   mainValues(values?: any[]): any[] | this {
//     if (values === undefined) return this._mainValues;
//     this._mainValues = values;
//     this._mainScale.domain(this._mainValues);
//     return this;
//   }

//   mainScale(): ScaleBand<any>;
//   mainScale(scale: ScaleBand<any>): this;
//   mainScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
//     if (scale === undefined) return this._mainScale;
//     this._mainScale = scale;
//     this._mainScale.domain(this._mainValues);
//     return this;
//   }

//   crossValues(): any[];
//   crossValues(values: any[]): this;
//   crossValues(values?: any[]): any[] | this {
//     if (values === undefined) return this._crossValues;
//     this._crossValues = values;
//     return this;
//   }

//   crossScale(): ScaleContinuousNumeric<number, number>;
//   crossScale(scale: ScaleContinuousNumeric<number, number>): this;
//   crossScale(
//     scale?: ScaleContinuousNumeric<number, number>
//   ): ScaleContinuousNumeric<number, number> | this {
//     if (scale === undefined) return this._crossScale;
//     this._crossScale = scale;
//     return this;
//   }

//   orientation(): BarOrientation;
//   orientation(orientation: BarOrientation): this;
//   orientation(orientation?: BarOrientation): BarOrientation | this {
//     if (orientation === undefined) return this._orientation;
//     this._orientation = orientation;
//     return this;
//   }

//   keys(): string[];
//   keys(keys: null): this;
//   keys(keys: string[]): this;
//   keys(keys?: string[] | null) {
//     if (keys === undefined) return this._keys;
//     if (keys === null) this._keys = undefined;
//     else this._keys = keys;
//     return this;
//   }

//   fitInSize(size: utils.ISize): this {
//     if (this._orientation === BarOrientation.Vertical) {
//       this._mainScale.range([0, size.width]);
//       this._crossScale.range([size.height, 0]);
//     } else if (this._orientation === BarOrientation.Horizontal) {
//       this._mainScale.range([0, size.height]);
//       this._crossScale.range([0, size.width]);
//     }

//     this._bars = [];

//     for (let i = 0; i < this._crossValues.length; ++i) {
//       const mv = this._mainValues[i];
//       const cv = this._crossValues[i];

//       if (this._orientation === BarOrientation.Vertical) {
//         this._bars.push({
//           mainIndex: i,
//           key: this._keys?.[i] || i.toString(),
//           rect: {
//             x: this._mainScale(mv)!,
//             y: Math.min(this._crossScale(0)!, this._crossScale(cv)!),
//             width: this._mainScale.bandwidth(),
//             height: Math.abs(this._crossScale(0)! - this._crossScale(cv)!),
//           },
//         });
//       } else if (this._orientation === BarOrientation.Horizontal) {
//         this._bars.push({
//           mainIndex: i,
//           key: this._keys?.[i] || i.toString(),
//           rect: {
//             x: Math.min(this._crossScale(0)!, this._crossScale(cv)!),
//             y: this._mainScale(mv)!,
//             width: Math.abs(this._crossScale(0)! - this._crossScale(cv)!),
//             height: this._mainScale.bandwidth(),
//           },
//         });
//       }
//     }

//     return this;
//   }

//   barData(): BarData[] {
//     return this._bars;
//   }
// }

// export interface BarsInputProperties {
//   mainValues: any[];
//   mainScale: ScaleBand<any>;
//   crossValues: any[];
//   crossScale: ScaleContinuousNumeric<number, number>;
//   keys: string[] | undefined;
//   orientation: BarOrientation;
// }

// export interface BarsOutputProperties {
//   barData: BarData[];
// }

// export function createBarData(props: BarsInputProperties, boundsSize: ISize): BarData[] {
//   if (props.orientation === BarOrientation.Vertical) {
//     props.mainScale.range([0, boundsSize.width]);
//     props.crossScale.range([boundsSize.height, 0]);
//   } else if (props.orientation === BarOrientation.Horizontal) {
//     props.mainScale.range([0, boundsSize.height]);
//     props.crossScale.range([0, boundsSize.width]);
//   }

//   const barData: BarData[] = [];

//   for (let i = 0; i < props.crossValues.length; ++i) {
//     const mv = props.mainValues[i];
//     const cv = props.crossValues[i];

//     if (props.orientation === BarOrientation.Vertical) {
//       barData.push({
//         mainIndex: i,
//         key: props.keys?.[i] || i.toString(),
//         rect: {
//           x: props.mainScale(mv)!,
//           y: Math.min(props.crossScale(0)!, props.crossScale(cv)!),
//           width: props.mainScale.bandwidth(),
//           height: Math.abs(props.crossScale(0)! - props.crossScale(cv)!),
//         },
//       });
//     } else if (props.orientation === BarOrientation.Horizontal) {
//       barData.push({
//         mainIndex: i,
//         key: props.keys?.[i] || i.toString(),
//         rect: {
//           x: Math.min(props.crossScale(0)!, props.crossScale(cv)!),
//           y: props.mainScale(mv)!,
//           width: Math.abs(props.crossScale(0)! - props.crossScale(cv)!),
//           height: props.mainScale.bandwidth(),
//         },
//       });
//     }
//   }
//   return barData;
// }

// export function barsCalculator(): BarsCalculator {
//   return new BarsCalculator();
// }

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
  // enterBars: (
  //   selection: Selection<EnterElement, BarData, BaseType, any>
  // ) => Selection<SVGElement, BarData, BaseType, any>;
  // exitBars: (selection: Selection<SVGElement, BarData, BaseType, any>) => void;
  // updateBars: (selection: Selection<SVGElement, BarData, BaseType, any>) => void;
  // decorateBars: (selection: Selection<SVGRectElement, BarData, any, any>) => void;
}

export const COLOR_BAR = COLORS_CATEGORICAL[0];

export const DATA_SERIES_BAR: DataSeriesBar = {
  mainValues: [],
  mainScale: scaleBand(),
  crossValues: [],
  crossScale: scaleLinear(),
  orientation: Orientation.Vertical,
};

export function seriesBar<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, Datum & DataSeriesBar, PElement, PDatum> {
  return selection
    .classed('series-bar', true)
    .attr('fill', COLOR_BAR)
    .transformData((d) => Object.assign(d || {}, DATA_SERIES_BAR, d))
    .on('render.seriesbar', function (e, d) {
      renderSeriesBar(select<GElement, Datum & DataSeriesBar>(this));
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
  return { ...DATA_SERIES_BAR, ...data };
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

// export function enterBars(
//   selection: SelectionOrTransition<EnterElement, BarData>
// ): Selection<SVGElement, BarData> {
//   return selection
//     .append('rect')
//     .classed('bar', true)
//     .call((s) => rectAttrs(s, (d) => minimizeRect(d)));
// }

// export function updateBars(selection: Selection<SVGElement, BarData>): void {}

// export function exitBars(selection: Selection<SVGElement, BarData>): void {}

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
