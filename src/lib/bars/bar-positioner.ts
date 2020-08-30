import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { max, Primitive } from 'd3-array';
import { Size } from '../utils';

export enum Orientation {
  Vertical,
  Horizontal,
}

export type Bar = { x: number; y: number; width: number; height: number };

export interface IBarPositioner {
  categories(categories?: Primitive[]): Primitive[] | this;
  values(values?: number[][]): number[][] | this;
  orientation(orientation?: Orientation): Orientation | this;
  flipCategories(flip?: boolean): boolean | this;
  flipValues(flip?: boolean): boolean | this;
  categoryPadding(padding?: number): number | this;
  //   subcategoryPadding(padding?: number): number | this;
  //   stack(stack?: boolean): boolean | this;
  fitInSize(size: Size): this;
  bars(): Bar[];
  categoriesScale(): ScaleBand<Primitive>;
  valuesScale(): ScaleLinear<number, number>;
}

export class BarPositioner implements IBarPositioner {
  private _categories: Primitive[] = [];
  private _values: number[][] = [];
  private _orientation: Orientation = Orientation.Vertical;
  private _categoryPadding: number = 0;
  private _flipValues: boolean = false;
  private _flipCategories: boolean = false;
  private _bars: Bar[] = [];
  private _categoriesScale: ScaleBand<Primitive> = scaleBand();
  private _valuesScale: ScaleLinear<number, number> = scaleLinear();

  constructor() {}

  categories(categories?: Primitive[]): Primitive[] | this {
    if (!arguments.length) return this._categories;
    this._categories = categories || [];
    return this;
  }
  values(values?: number[][]): number[][] | this {
    if (!arguments.length) return this._values;
    this._values = values || [];
    return this;
  }
  orientation(orientation?: Orientation): Orientation | this {
    if (!arguments.length) return this._orientation;
    this._orientation = orientation || Orientation.Vertical;
    return this;
  }
  categoryPadding(padding?: number): number | this {
    if (!arguments.length) return this._categoryPadding;
    this._categoryPadding = padding || 0;
    return this;
  }
  flipCategories(flip?: boolean): boolean | this {
    if (!arguments.length) return this._flipCategories;
    this._flipCategories = flip || false;
    return this;
  }
  flipValues(flip?: boolean): boolean | this {
    if (!arguments.length) return this._flipValues;
    this._flipValues = flip || false;
    return this;
  }
  fitInSize(size: Size): this {
    this._categoriesScale
      .domain(this._categories)
      .padding(this._categoryPadding);
    this._valuesScale.domain([0, max(this._values.map((v) => max(v)!))!]);

    if (this._orientation === Orientation.Vertical) {
      this._categoriesScale.range(
        this._flipCategories ? [size.width, 0] : [0, size.width]
      );
      this._valuesScale.range(
        this._flipValues ? [0, size.height] : [size.height, 0]
      );
    } else if (this._orientation === Orientation.Horizontal) {
      this._categoriesScale.range(
        this._flipCategories ? [size.height, 0] : [0, size.height]
      );
      this._valuesScale.range(
        this._flipValues ? [size.width, 0] : [0, size.width]
      );
    }

    this._bars = [];
    for (let i = 0; i < this._values.length; ++i) {
      const values = this._values[i];
      for (let j = 0; j < values.length; ++j) {
        const c = this._categories[j];
        const v = values[j];

        if (this._orientation === Orientation.Vertical) {
          this._bars.push({
            x: this._categoriesScale(c)!,
            y: Math.min(this._valuesScale(0), this._valuesScale(v)),
            width: this._categoriesScale.bandwidth(),
            height: Math.abs(this._valuesScale(0) - this._valuesScale(v)),
          });
        } else if (this._orientation === Orientation.Horizontal) {
          this._bars.push({
            x: Math.min(this._valuesScale(0), this._valuesScale(v)),
            y: this._categoriesScale(c)!,
            width: Math.abs(this._valuesScale(0) - this._valuesScale(v)),
            height: this._categoriesScale.bandwidth(),
          });
        }
      }
    }
    return this;
  }
  bars(): Bar[] {
    return this._bars;
  }
  categoriesScale(): ScaleBand<Primitive> {
    return this._categoriesScale;
  }
  valuesScale(): ScaleLinear<number, number> {
    return this._valuesScale;
  }
}

export function barPositioner(): BarPositioner {
  return new BarPositioner();
}
