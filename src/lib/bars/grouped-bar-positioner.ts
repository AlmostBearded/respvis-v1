import { IBarPositioner, Bar, Orientation } from './bar-positioner';
import { Size } from '../utils';
import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3-scale';
import { Primitive, max, range } from 'd3-array';

export interface IGroupedBarPositioner {
  categories(categories: Primitive[]): this;
  categories(): Primitive[];
  values(values: number[][]): this;
  values(): number[][];
  orientation(orientation: Orientation): this;
  orientation(): Orientation;
  flipCategories(flip: boolean): this;
  flipCategories(): boolean;
  flipSubcategories(flip: boolean): this;
  flipSubcategories(): boolean;
  flipValues(flip: boolean): this;
  flipValues(): boolean;
  categoryPadding(padding: number): this;
  categoryPadding(): number;
  subcategoryPadding(padding: number): this;
  subcategoryPadding(): number;
  fitInSize(size: Size): this;
  bars(): Bar[];
  categoriesScale(): ScaleBand<Primitive>;
  subcategoriesScale(): ScaleBand<Primitive>;
  valuesScale(): ScaleLinear<number, number>;
}

export class GroupedBarPositioner implements IGroupedBarPositioner {
  private _categories: Primitive[] = [];
  private _values: number[][] = [];
  private _orientation: Orientation = Orientation.Vertical;
  private _categoryPadding: number = 0.1;
  private _subcategoryPadding: number = 0;
  private _flipValues: boolean = false;
  private _flipCategories: boolean = false;
  private _flipSubcategories: boolean = false;
  private _bars: Bar[] = [];
  private _categoriesScale: ScaleBand<Primitive> = scaleBand();
  private _subcategoriesScale: ScaleBand<Primitive> = scaleBand();
  private _valuesScale: ScaleLinear<number, number> = scaleLinear();

  constructor() {}

  categories(categories?: Primitive[]): any {
    if (categories === undefined) return this._categories;
    this._categories = categories;
    return this;
  }
  values(values?: number[][]): any {
    if (values === undefined) return this._values;
    this._values = values;
    return this;
  }
  orientation(orientation?: Orientation): any {
    if (orientation === undefined) return this._orientation;
    this._orientation = orientation;
    return this;
  }
  categoryPadding(padding?: number): any {
    if (padding === undefined) return this._categoryPadding;
    this._categoryPadding = padding;
    return this;
  }
  subcategoryPadding(padding?: number | undefined): any {
    if (padding === undefined) return this._subcategoryPadding;
    this._subcategoryPadding = padding;
    return this;
  }
  flipCategories(flip?: boolean): any {
    if (flip === undefined) return this._flipCategories;
    this._flipCategories = flip;
    return this;
  }
  flipSubcategories(flip?: boolean | undefined): any {
    if (flip === undefined) return this._flipSubcategories;
    this._flipSubcategories = flip;
    return this;
  }
  flipValues(flip?: boolean): any {
    if (flip === undefined) return this._flipValues;
    this._flipValues = flip;
    return this;
  }
  fitInSize(size: Size): this {
    this._categoriesScale.domain(this._categories).padding(this._categoryPadding);
    this._subcategoriesScale.domain(range(this._values[0]?.length)).padding(this._subcategoryPadding);
    this._valuesScale.domain([0, max(this._values.map((v) => max(v)!))!]);

    if (this._orientation === Orientation.Vertical) {
      this._categoriesScale.range(this._flipCategories ? [size.width, 0] : [0, size.width]);
      this._valuesScale.range(this._flipValues ? [0, size.height] : [size.height, 0]);
    } else if (this._orientation === Orientation.Horizontal) {
      this._categoriesScale.range(this._flipCategories ? [size.height, 0] : [0, size.height]);
      this._valuesScale.range(this._flipValues ? [size.width, 0] : [0, size.width]);
    }
    const categoryBandwidth = this._categoriesScale.bandwidth();
    this._subcategoriesScale.range(
      this._flipSubcategories ? [categoryBandwidth, 0] : [0, categoryBandwidth]
    );

    this._bars = [];
    for (let i = 0; i < this._values.length; ++i) {
      const subcategoryValues = this._values[i];
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._categories[i];
        const v = subcategoryValues[j];

        if (this._orientation === Orientation.Vertical) {
          this._bars.push({
            x: this._categoriesScale(c)! + this._subcategoriesScale(j)!,
            y: Math.min(this._valuesScale(0), this._valuesScale(v)),
            width: this._subcategoriesScale.bandwidth(),
            height: Math.abs(this._valuesScale(0) - this._valuesScale(v)),
          });
        } else if (this._orientation === Orientation.Horizontal) {
          this._bars.push({
            x: Math.min(this._valuesScale(0), this._valuesScale(v)),
            y: this._categoriesScale(c)! + this._subcategoriesScale(j)!,
            width: Math.abs(this._valuesScale(0) - this._valuesScale(v)),
            height: this._subcategoriesScale.bandwidth(),
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
  subcategoriesScale(): ScaleBand<Primitive> {
    return this._subcategoriesScale;
  }
  valuesScale(): ScaleLinear<number, number> {
    return this._valuesScale;
  }
}

export function groupedBarPositioner(): GroupedBarPositioner {
  return new GroupedBarPositioner();
}
