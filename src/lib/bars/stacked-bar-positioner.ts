import { max, Primitive } from 'd3-array';
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { Rect, utils } from '../core';
import { BarOrientation, IBars } from './bar-positioner';

export interface IStackedBars extends IBars {}

export interface IStackedBarsPositionerConfig {
  categories: string[];
  values: number[][];
  orientation: BarOrientation;
  categoryPadding: number;
}

export interface IStackedBarPositioner extends IStackedBars {
  config(config: IStackedBarsPositionerConfig): this;
  config(): IStackedBarsPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export class StackedBarPositioner implements IStackedBarPositioner {
  private _config: IStackedBarsPositionerConfig;
  private _bars: Rect[] = [];
  private _categoriesScale: ScaleBand<Primitive> = scaleBand();
  private _valuesScale: ScaleLinear<number, number> = scaleLinear();

  constructor() {
    this._config = {
      categories: [],
      values: [],
      orientation: BarOrientation.Vertical,
      categoryPadding: 0.1,
    };
  }

  config(config: IStackedBarsPositionerConfig): this;
  config(): IStackedBarsPositionerConfig;
  config(config?: IStackedBarsPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);
    return this;
  }

  fitInSize(size: utils.ISize): this {
    this._categoriesScale.domain(this._config.categories).padding(this._config.categoryPadding);
    this._valuesScale.domain([
      0,
      max(this._config.values.map((values) => values.reduce((a, b) => a + b)))!,
    ]);

    if (this._config.orientation === BarOrientation.Vertical) {
      this._categoriesScale.range([0, size.width]);
      this._valuesScale.range([size.height, 0]);
    } else if (this._config.orientation === BarOrientation.Horizontal) {
      this._categoriesScale.range([0, size.height]);
      this._valuesScale.range([0, size.width]);
    }

    this._bars = [];
    for (let i = 0; i < this._config.categories.length; ++i) {
      const subcategoryValues = this._config.values[i];
      let sum = 0;
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._config.categories[i];
        const v = subcategoryValues[j];

        if (this._config.orientation === BarOrientation.Vertical) {
          this._bars.push({
            x: this._categoriesScale(c)!,
            y: -sum + Math.min(this._valuesScale(0)!, this._valuesScale(v)!),
            width: this._categoriesScale.bandwidth(),
            height: Math.abs(this._valuesScale(0)! - this._valuesScale(v)!),
          });
          sum += this._bars[this._bars.length - 1].height;
        } else if (this._config.orientation === BarOrientation.Horizontal) {
          this._bars.push({
            x: sum + Math.min(this._valuesScale(0)!, this._valuesScale(v)!),
            y: this._categoriesScale(c)!,
            width: Math.abs(this._valuesScale(0)! - this._valuesScale(v)!),
            height: this._categoriesScale.bandwidth(),
          });
          sum += this._bars[this._bars.length - 1].width;
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

  valuesScale(): ScaleLinear<number, number> {
    return this._valuesScale;
  }
}

export function stackedBarPositioner(): StackedBarPositioner {
  return new StackedBarPositioner();
}
