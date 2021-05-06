import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { bandScale, linearScale, Rect } from '../core';
import { Size } from '../core/utils';
import { DataBar, BarOrientation } from './series-bar';

export interface StackedBars {
  mainValues(): any[];
  mainValues(categories: any[]): this;
  mainScale(): ScaleBand<any>;
  mainScale(scale: ScaleBand<any>): this;
  crossValues(): any[][];
  crossValues(values: any[][]): this;
  crossScale(): ScaleContinuousNumeric<number, number>;
  crossScale(scale: ScaleContinuousNumeric<number, number>): this;
  keys(): string[][];
  keys(keys: null): this;
  keys(keys: string[][]): this;
  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  barData(): StackedBarData[][];
}

export interface StackedBarData extends DataBar {
  index: number;
  crossIndex: number;
  rect: Rect<number>;
}

export class StackedBarsCalculator implements StackedBars {
  private _categories: any[];
  private _categoryScale: ScaleBand<any>;
  private _values: number[][];
  private _valueScale: ScaleContinuousNumeric<number, number>;
  private _orientation: BarOrientation;
  private _keys: string[][] | undefined;
  private _bars: StackedBarData[][];

  constructor() {
    this._categories = [];
    this._categoryScale = bandScale().padding(0.1);
    this._values = [];
    this._valueScale = linearScale();
    this._orientation = BarOrientation.Vertical;
    this._bars = [];
  }

  mainValues(): any[];
  mainValues(categories: any[]): this;
  mainValues(categories?: any) {
    if (categories === undefined) return this._categories;
    this._categories = categories;
    this._categoryScale.domain(this._categories);
    return this;
  }

  mainScale(): ScaleBand<any>;
  mainScale(scale: ScaleBand<any>): this;
  mainScale(scale?: any) {
    if (scale === undefined) return this._categoryScale;
    this._categoryScale = scale;
    this._categoryScale.domain(this._categories);
    return this;
  }

  crossValues(): any[][];
  crossValues(values: any[][]): this;
  crossValues(values?: any) {
    if (values === undefined) return this._values;
    this._values = values;
    return this;
  }

  crossScale(): ScaleContinuousNumeric<number, number>;
  crossScale(scale: ScaleContinuousNumeric<number, number>): this;
  crossScale(scale?: any) {
    if (scale === undefined) return this._valueScale;
    this._valueScale = scale;
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: any) {
    if (orientation === undefined) return this._orientation;
    this._orientation = orientation;
    return this;
  }

  keys(): string[][];
  keys(keys: null): this;
  keys(keys: string[][]): this;
  keys(keys?: string[][] | null) {
    if (keys === undefined) return this._keys;
    if (keys === null) this._keys = undefined;
    else this._keys = keys;
    return this;
  }

  barData(): StackedBarData[][] {
    return this._bars;
  }

  fitInSize(size: Size): this {
    if (this._orientation === BarOrientation.Vertical) {
      this._categoryScale.range([0, size.width]);
      this._valueScale.range([size.height, 0]);
    } else if (this._orientation === BarOrientation.Horizontal) {
      this._categoryScale.range([0, size.height]);
      this._valueScale.range([0, size.width]);
    }

    this._bars = [];
    for (let i = 0; i < this._categories.length; ++i) {
      const barStack: StackedBarData[] = [];
      this._bars.push(barStack);

      const subcategoryValues = this._values[i];
      let sum = 0;
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._categories[i];
        const v = subcategoryValues[j];

        if (this._orientation === BarOrientation.Vertical) {
          const bar: StackedBarData = {
            index: i,
            crossIndex: j,
            key: this._keys?.[i][j] || `${i}/${j}`,
            rect: {
              x: this._categoryScale(c)!,
              y: -sum + Math.min(this._valueScale(0)!, this._valueScale(v)!),
              width: this._categoryScale.bandwidth(),
              height: Math.abs(this._valueScale(0)! - this._valueScale(v)!),
            },
          };
          barStack.push(bar);
          sum += bar.rect.height;
        } else if (this._orientation === BarOrientation.Horizontal) {
          const bar: StackedBarData = {
            index: i,
            crossIndex: j,
            key: this._keys?.[i][j] || `${i}/${j}`,
            rect: {
              x: sum + Math.min(this._valueScale(0)!, this._valueScale(v)!),
              y: this._categoryScale(c)!,
              width: Math.abs(this._valueScale(0)! - this._valueScale(v)!),
              height: this._categoryScale.bandwidth(),
            },
          };
          barStack.push(bar);
          sum += bar.rect.width;
        }
      }
    }
    return this;
  }
}

export function stackedBarsCalculator(): StackedBarsCalculator {
  return new StackedBarsCalculator();
}
