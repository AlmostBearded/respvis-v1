import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { bandScale, linearScale, utils } from '../core';
import { Rect } from '../core/rect';

export enum BarOrientation {
  Vertical,
  Horizontal,
}

export interface Bars {
  categories(): any[];
  categories(categories: any[]): this;
  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  values(): any[];
  values(values: any[]): this;
  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  bars(): Rect<number>[];
}

export class BarsCalculator implements Bars {
  private _categories: any[];
  private _categoryScale: ScaleBand<any>;
  private _values: number[];
  private _valueScale: ScaleContinuousNumeric<number, number>;
  private _orientation: BarOrientation;
  private _bars: Rect<number>[];

  constructor() {
    this._categories = [];
    this._categoryScale = bandScale();
    this._values = [];
    this._valueScale = linearScale();
    this._orientation = BarOrientation.Vertical;
    this._bars = [];
  }

  categories(): any[];
  categories(categories: any[]): this;
  categories(categories?: any[]): any[] | this {
    if (categories === undefined) return this._categories;
    this._categories = categories;
    this._categoryScale.domain(this._categories);
    return this;
  }

  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  categoryScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
    if (scale === undefined) return this._categoryScale;
    this._categoryScale = scale;
    this._categoryScale.domain(this._categories);
    return this;
  }

  values(): any[];
  values(values: any[]): this;
  values(values?: any[]): any[] | this {
    if (values === undefined) return this._values;
    this._values = values;
    return this;
  }

  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  valueScale(
    scale?: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> | this {
    if (scale === undefined) return this._valueScale;
    this._valueScale = scale;
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: BarOrientation): BarOrientation | this {
    if (orientation === undefined) return this._orientation;
    this._orientation = orientation;
    return this;
  }

  fitInSize(size: utils.ISize): this {
    if (this._orientation === BarOrientation.Vertical) {
      this._categoryScale.range([0, size.width]);
      this._valueScale.range([size.height, 0]);
    } else if (this._orientation === BarOrientation.Horizontal) {
      this._categoryScale.range([0, size.height]);
      this._valueScale.range([0, size.width]);
    }

    this._bars = [];

    for (let i = 0; i < this._values.length; ++i) {
      const c = this._categories[i];
      const v = this._values[i];

      if (this._orientation === BarOrientation.Vertical) {
        this._bars.push({
          x: this._categoryScale(c)!,
          y: Math.min(this._valueScale(0)!, this._valueScale(v)!),
          width: this._categoryScale.bandwidth(),
          height: Math.abs(this._valueScale(0)! - this._valueScale(v)!),
        });
      } else if (this._orientation === BarOrientation.Horizontal) {
        this._bars.push({
          x: Math.min(this._valueScale(0)!, this._valueScale(v)!),
          y: this._categoryScale(c)!,
          width: Math.abs(this._valueScale(0)! - this._valueScale(v)!),
          height: this._categoryScale.bandwidth(),
        });
      }
    }

    return this;
  }

  bars(): Rect<number>[] {
    return this._bars;
  }
}

export function barsCalculator(): BarsCalculator {
  return new BarsCalculator();
}
