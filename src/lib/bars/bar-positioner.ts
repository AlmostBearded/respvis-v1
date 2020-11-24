import { Rect, utils } from '../core';
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { max, Primitive } from 'd3-array';

export enum BarOrientation {
  Vertical,
  Horizontal,
}

export interface IBars {
  bars(): Rect[];
  categoriesScale(): ScaleBand<Primitive>;
  valuesScale(): ScaleLinear<number, number>;
}

export interface IBarPositionerConfig {
  categories: string[];
  values: number[];
  orientation: BarOrientation;
  categoryPadding: number;
}

export interface IBarPositioner extends IBars {
  config(config: IBarPositionerConfig): this;
  config(): IBarPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export class BarPositioner implements IBarPositioner {
  private _config: IBarPositionerConfig;
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

  config(config: IBarPositionerConfig): this;
  config(): IBarPositionerConfig;
  config(config?: IBarPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);
    this._categoriesScale.domain(this._config.categories).padding(this._config.categoryPadding);
    this._valuesScale.domain([0, max(this._config.values)!]);
    return this;
  }

  fitInSize(size: utils.ISize): this {
    if (this._config.orientation === BarOrientation.Vertical) {
      this._categoriesScale.range([0, size.width]);
      this._valuesScale.range([size.height, 0]);
    } else if (this._config.orientation === BarOrientation.Horizontal) {
      this._categoriesScale.range([0, size.height]);
      this._valuesScale.range([0, size.width]);
    }

    this._bars = [];
    for (let i = 0; i < this._config.values.length; ++i) {
      const c = this._config.categories[i];
      const v = this._config.values[i];

      if (this._config.orientation === BarOrientation.Vertical) {
        this._bars.push({
          x: this._categoriesScale(c)!,
          y: Math.min(this._valuesScale(0)!, this._valuesScale(v)!),
          width: this._categoriesScale.bandwidth(),
          height: Math.abs(this._valuesScale(0)! - this._valuesScale(v)!),
        });
      } else if (this._config.orientation === BarOrientation.Horizontal) {
        this._bars.push({
          x: Math.min(this._valuesScale(0)!, this._valuesScale(v)!),
          y: this._categoriesScale(c)!,
          width: Math.abs(this._valuesScale(0)! - this._valuesScale(v)!),
          height: this._categoriesScale.bandwidth(),
        });
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

export function barPositioner(): BarPositioner {
  return new BarPositioner();
}
