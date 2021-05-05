import { scaleBand, ScaleBand, ScaleContinuousNumeric, scaleLinear } from 'd3-scale';
import { BaseType, EnterElement, select, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import { COLORS_CATEGORICAL, initG } from '../core';
import { Rect } from '../core/utility/rect';
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

export interface Data {
  mainIndex: number;
  key: string;
  rect: Rect<number>;
}

export interface SeriesData {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  crossValues: any[];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys: string[] | undefined;
  orientation: Orientation;
  bounds: Size;
  joinBars: (selection: Selection<SVGRectElement, Data, any, any>) => void;
}

export const DEFAULT_COLOR = COLORS_CATEGORICAL[0];

export function series() {

  return function(selection) {
    
  }
}

export function appendSeries<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<SVGGElement, SeriesData, PElement, PDatum> {
  return initSeries(selection.append('g').call(initG));
}

export function initSeries<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, Datum, PElement, PDatum>
): Selection<GElement, SeriesData, PElement, PDatum> {
  return selection
    .datum<SeriesData>({
      mainValues: [],
      mainScale: scaleBand(),
      crossValues: [],
      crossScale: scaleLinear(),
      keys: undefined,
      orientation: Orientation.Vertical,
      bounds: { width: 600, height: 400 },
      joinBars: joinBars,
    })
    .attr('fill', DEFAULT_COLOR)
    .on('afterlayout.barseries', function () {
      const s = select<GElement, SeriesData>(this);
      s.dataProperty('bounds', s.layout()!);
    })
    .on('render.barseries', function () {
      select<GElement, SeriesData>(this).call(renderSeries);
    });
}

export function renderSeries<GElement extends BaseType, PElement extends BaseType, PDatum>(
  selection: Selection<GElement, SeriesData, PElement, PDatum>
): void {
  selection.each(function (d) {
    select<GElement, SeriesData>(this)
      .selectAll<SVGElement, Data>('.bar')
      .data(
        (d) => createData(d),
        (d, i) => d.key
      )
      .call(d.joinBars);
  });
}

export function createData(seriesData: SeriesData): Data[] {
  if (seriesData.orientation === Orientation.Vertical) {
    seriesData.mainScale.range([0, seriesData.bounds.width]);
    seriesData.crossScale.range([seriesData.bounds.height, 0]);
  } else if (seriesData.orientation === Orientation.Horizontal) {
    seriesData.mainScale.range([0, seriesData.bounds.height]);
    seriesData.crossScale.range([0, seriesData.bounds.width]);
  }

  const data: Data[] = [];

  for (let i = 0; i < seriesData.crossValues.length; ++i) {
    const mv = seriesData.mainValues[i];
    const cv = seriesData.crossValues[i];

    if (seriesData.orientation === Orientation.Vertical) {
      data.push({
        mainIndex: i,
        key: seriesData.keys?.[i] || i.toString(),
        rect: {
          x: seriesData.mainScale(mv)!,
          y: Math.min(seriesData.crossScale(0)!, seriesData.crossScale(cv)!),
          width: seriesData.mainScale.bandwidth(),
          height: Math.abs(seriesData.crossScale(0)! - seriesData.crossScale(cv)!),
        },
      });
    } else if (seriesData.orientation === Orientation.Horizontal) {
      data.push({
        mainIndex: i,
        key: seriesData.keys?.[i] || i.toString(),
        rect: {
          x: Math.min(seriesData.crossScale(0)!, seriesData.crossScale(cv)!),
          y: seriesData.mainScale(mv)!,
          width: Math.abs(seriesData.crossScale(0)! - seriesData.crossScale(cv)!),
          height: seriesData.mainScale.bandwidth(),
        },
      });
    }
  }
  return data;
}

export function joinBars<PElement extends BaseType, PDatum>(
  selection: Selection<SVGRectElement, Data, PElement, PDatum>
) {
  selection
    .enter()
    .append('rect')
    .classed('bar', true)
    .call(setMinimizedRectAttributes)
    .merge(selection)
    .transition()
    .duration(250)
    .call(setRectAttributes);

  selection
    .exit<Data>()
    // todo: class not removed if exit transition cancelled (can this happen?)
    .classed('exiting', true)
    .transition()
    .duration(250)
    .call(setMinimizedRectAttributes)
    .remove();
}

export function setMinimizedRectAttributes(
  selection: SelectionOrTransition<SVGRectElement, Data, any, any>
) {
  selection
    .attr('x', (d) => d.rect.x + d.rect.width / 2)
    .attr('y', (d) => d.rect.y + d.rect.height / 2)
    .attr('width', 0)
    .attr('height', 0);
}

export function setRectAttributes(
  selection: SelectionOrTransition<SVGRectElement, Data, any, any>
) {
  selection
    .attr('x', (d) => d.rect.x)
    .attr('y', (d) => d.rect.y)
    .attr('width', (d) => d.rect.width)
    .attr('height', (d) => d.rect.height);
}
