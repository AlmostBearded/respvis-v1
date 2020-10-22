import { IBarPositioner, Orientation, IBars } from './bar-positioner';
import { deepExtend, ISize } from '../../utils';
import { ScaleBand, ScaleLinear, scaleBand, scaleLinear } from 'd3-scale';
import { Primitive, max, range } from 'd3-array';
import { Rect } from '../../rect';

export interface IGroupedBars extends IBars {
  subcategoriesScale(): ScaleBand<Primitive>;
}

export interface IGroupedBarPositionerConfig {
  categories: string[];
  values: number[][];
  orientation: Orientation;
  flipCategories: boolean;
  flipSubcategories: boolean;
  flipValues: boolean;
  categoryPadding: number;
  subcategoryPadding: number;
}

export interface IGroupedBarPositioner extends IGroupedBars {
  config(config: IGroupedBarPositionerConfig): this;
  config(): IGroupedBarPositionerConfig;
  fitInSize(size: ISize): this;
}

export class GroupedBarPositioner implements IGroupedBarPositioner {
  private _config: IGroupedBarPositionerConfig;
  private _bars: Rect[] = [];
  private _categoriesScale: ScaleBand<Primitive> = scaleBand();
  private _subcategoriesScale: ScaleBand<Primitive> = scaleBand();
  private _valuesScale: ScaleLinear<number, number> = scaleLinear();

  constructor() {
    this._config = {
      categories: [],
      values: [],
      orientation: Orientation.Vertical,
      categoryPadding: 0.1,
      subcategoryPadding: 0.1,
      flipCategories: false,
      flipSubcategories: false,
      flipValues: false,
    };
  }

  config(config: IGroupedBarPositionerConfig): this;
  config(): IGroupedBarPositionerConfig;
  config(config?: IGroupedBarPositionerConfig): any {
    if (config === undefined) return this._config;
    deepExtend(this._config, config);
    return this;
  }

  fitInSize(size: ISize): this {
    this._categoriesScale.domain(this._config.categories).padding(this._config.categoryPadding);
    this._subcategoriesScale
      .domain(range(this._config.values[0]?.length))
      .padding(this._config.subcategoryPadding);
    this._valuesScale.domain([0, max(this._config.values.map((v) => max(v)!))!]);

    if (this._config.orientation === Orientation.Vertical) {
      this._categoriesScale.range(this._config.flipCategories ? [size.width, 0] : [0, size.width]);
      this._valuesScale.range(this._config.flipValues ? [0, size.height] : [size.height, 0]);
    } else if (this._config.orientation === Orientation.Horizontal) {
      this._categoriesScale.range(
        this._config.flipCategories ? [size.height, 0] : [0, size.height]
      );
      this._valuesScale.range(this._config.flipValues ? [size.width, 0] : [0, size.width]);
    }
    const categoryBandwidth = this._categoriesScale.bandwidth();
    this._subcategoriesScale.range(
      this._config.flipSubcategories ? [categoryBandwidth, 0] : [0, categoryBandwidth]
    );

    this._bars = [];
    for (let i = 0; i < this._config.values.length; ++i) {
      const subcategoryValues = this._config.values[i];
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._config.categories[i];
        const v = subcategoryValues[j];

        if (this._config.orientation === Orientation.Vertical) {
          this._bars.push({
            x: this._categoriesScale(c)! + this._subcategoriesScale(j)!,
            y: Math.min(this._valuesScale(0), this._valuesScale(v)),
            width: this._subcategoriesScale.bandwidth(),
            height: Math.abs(this._valuesScale(0) - this._valuesScale(v)),
          });
        } else if (this._config.orientation === Orientation.Horizontal) {
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

  bars(): Rect[] {
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
