import { range } from 'd3-array';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { linearScale, Rect, utils, bandScale } from '../core';
import { ISize } from '../core/utils';
import { BarOrientation } from './bars';

export interface GroupedBars {
  categories(): any[];
  categories(categories: any[]): this;
  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  values(): any[][];
  values(values: any[][]): this;
  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  subcategoryScale(): ScaleBand<any>;
  subcategoryScale(scale: ScaleBand<any>): this;
  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  bars(): Rect<number>[];
}

export class GroupedBarsCalculator implements GroupedBars {
  private _categories: any[];
  private _categoryScale: ScaleBand<any>;
  private _subcategoryScale: ScaleBand<any>;
  private _values: number[][];
  private _valueScale: ScaleContinuousNumeric<number, number>;
  private _orientation: BarOrientation;
  private _bars: Rect<number>[];

  constructor() {
    this._categories = [];
    this._categoryScale = bandScale().padding(0.1);
    this._subcategoryScale = bandScale().padding(0.1);
    this._values = [];
    this._valueScale = linearScale();
    this._orientation = BarOrientation.Vertical;
    this._bars = [];
  }

  categories(): any[];
  categories(categories: any[]): this;
  categories(categories?: any) {
    if (categories === undefined) return this._categories;
    this._categories = categories;
    this._categoryScale.domain(this._categories);
    return this;
  }

  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  categoryScale(scale?: any) {
    if (scale === undefined) return this._categoryScale;
    this._categoryScale = scale;
    this._categoryScale.domain(this._categories);
    return this;
  }

  values(): any[][];
  values(values: any[][]): this;
  values(values?: any) {
    if (values === undefined) return this._values;
    this._values = values;
    this._subcategoryScale.domain(range(this._values[0]?.length || 0));
    return this;
  }

  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  valueScale(scale?: any) {
    if (scale === undefined) return this._valueScale;
    this._valueScale = scale;
    return this;
  }

  subcategoryScale(): ScaleBand<any>;
  subcategoryScale(scale: ScaleBand<any>): this;
  subcategoryScale(scale?: any) {
    if (scale === undefined) return this._subcategoryScale;
    this._subcategoryScale = scale;
    this._subcategoryScale.domain(range(this._values[0]?.length || 0));
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: any) {
    if (orientation === undefined) return this._orientation;
    this._orientation = orientation;
    return this;
  }

  bars(): Rect<number>[] {
    return this._bars;
  }

  fitInSize(size: ISize): this {
    if (this._orientation === BarOrientation.Vertical) {
      this._categoryScale.range([0, size.width]);
      this._valueScale.range([size.height, 0]);
    } else if (this._orientation === BarOrientation.Horizontal) {
      this._categoryScale.range([0, size.height]);
      this._valueScale.range([0, size.width]);
    }
    this._subcategoryScale.range([0, this._categoryScale.bandwidth()]);

    this._bars = [];
    for (let i = 0; i < this._values.length; ++i) {
      const subcategoryValues = this._values[i];
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._categories[i];
        const v = subcategoryValues[j];

        if (this._orientation === BarOrientation.Vertical) {
          this._bars.push({
            x: this._categoryScale(c)! + this._subcategoryScale(j)!,
            y: Math.min(this._valueScale(0)!, this._valueScale(v)!),
            width: this._subcategoryScale.bandwidth(),
            height: Math.abs(this._valueScale(0)! - this._valueScale(v)!),
          });
        } else if (this._orientation === BarOrientation.Horizontal) {
          this._bars.push({
            x: Math.min(this._valueScale(0)!, this._valueScale(v)!),
            y: this._categoryScale(c)! + this._subcategoryScale(j)!,
            width: Math.abs(this._valueScale(0)! - this._valueScale(v)!),
            height: this._subcategoryScale.bandwidth(),
          });
        }
      }
    }

    return this;
  }
}

export function groupedBarsCalculator(): GroupedBarsCalculator {
  return new GroupedBarsCalculator();
}
