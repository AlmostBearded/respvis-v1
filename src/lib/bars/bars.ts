import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { bandScale, linearScale, utils } from '../core';
import { Rect } from '../core/rect';

export enum BarOrientation {
  Vertical,
  Horizontal,
}

export interface Bars {
  mainValues(): any[];
  mainValues(values: any[]): this;
  mainScale(): ScaleBand<any>;
  mainScale(scale: ScaleBand<any>): this;
  crossValues(): any[];
  crossValues(values: any[]): this;
  crossScale(): ScaleContinuousNumeric<number, number>;
  crossScale(scale: ScaleContinuousNumeric<number, number>): this;
  keys(): string[];
  keys(keys: null): this;
  keys(keys: string[]): this;
  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  barData(): BarData[];
}

export interface BarData {
  mainIndex: number;
  key: string;
  rect: Rect<number>;
}

export class BarsCalculator implements Bars {
  private _mainValues: any[];
  private _mainScale: ScaleBand<any>;
  private _crossValues: number[];
  private _crossScale: ScaleContinuousNumeric<number, number>;
  private _orientation: BarOrientation;
  private _keys: string[] | undefined;
  private _bars: BarData[];

  constructor() {
    this._mainValues = [];
    this._mainScale = bandScale();
    this._crossValues = [];
    this._crossScale = linearScale();
    this._orientation = BarOrientation.Vertical;
    this._bars = [];
  }

  mainValues(): any[];
  mainValues(values: any[]): this;
  mainValues(values?: any[]): any[] | this {
    if (values === undefined) return this._mainValues;
    this._mainValues = values;
    this._mainScale.domain(this._mainValues);
    return this;
  }

  mainScale(): ScaleBand<any>;
  mainScale(scale: ScaleBand<any>): this;
  mainScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
    if (scale === undefined) return this._mainScale;
    this._mainScale = scale;
    this._mainScale.domain(this._mainValues);
    return this;
  }

  crossValues(): any[];
  crossValues(values: any[]): this;
  crossValues(values?: any[]): any[] | this {
    if (values === undefined) return this._crossValues;
    this._crossValues = values;
    return this;
  }

  crossScale(): ScaleContinuousNumeric<number, number>;
  crossScale(scale: ScaleContinuousNumeric<number, number>): this;
  crossScale(
    scale?: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> | this {
    if (scale === undefined) return this._crossScale;
    this._crossScale = scale;
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: BarOrientation): BarOrientation | this {
    if (orientation === undefined) return this._orientation;
    this._orientation = orientation;
    return this;
  }

  keys(): string[];
  keys(keys: null): this;
  keys(keys: string[]): this;
  keys(keys?: string[] | null) {
    if (keys === undefined) return this._keys;
    if (keys === null) this._keys = undefined;
    else this._keys = keys;
    return this;
  }

  fitInSize(size: utils.ISize): this {
    if (this._orientation === BarOrientation.Vertical) {
      this._mainScale.range([0, size.width]);
      this._crossScale.range([size.height, 0]);
    } else if (this._orientation === BarOrientation.Horizontal) {
      this._mainScale.range([0, size.height]);
      this._crossScale.range([0, size.width]);
    }

    this._bars = [];

    for (let i = 0; i < this._crossValues.length; ++i) {
      const mv = this._mainValues[i];
      const cv = this._crossValues[i];

      if (this._orientation === BarOrientation.Vertical) {
        this._bars.push({
          mainIndex: i,
          key: this._keys?.[i] || i.toString(),
          rect: {
            x: this._mainScale(mv)!,
            y: Math.min(this._crossScale(0)!, this._crossScale(cv)!),
            width: this._mainScale.bandwidth(),
            height: Math.abs(this._crossScale(0)! - this._crossScale(cv)!),
          },
        });
      } else if (this._orientation === BarOrientation.Horizontal) {
        this._bars.push({
          mainIndex: i,
          key: this._keys?.[i] || i.toString(),
          rect: {
            x: Math.min(this._crossScale(0)!, this._crossScale(cv)!),
            y: this._mainScale(mv)!,
            width: Math.abs(this._crossScale(0)! - this._crossScale(cv)!),
            height: this._mainScale.bandwidth(),
          },
        });
      }
    }

    return this;
  }

  barData(): BarData[] {
    return this._bars;
  }
}

export function barsCalculator(): BarsCalculator {
  return new BarsCalculator();
}
