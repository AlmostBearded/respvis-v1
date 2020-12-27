import {
  applyBandScaleConfig,
  applyScaleConfig,
  bandScale,
  IBandScaleConfig,
  IScaleConfig,
  linearScale,
  Rect,
  utils,
} from '../core';
import { BarOrientation, IBars } from './bar-positioner';

export interface IStackedBarPositionerConfig {
  categories: string[];
  categoryScale: IBandScaleConfig;
  values: number[][];
  valueScale: IScaleConfig<number, number, number>;
  orientation: BarOrientation;
}

export interface IStackedBarPositioner extends IBars {
  config(config: IStackedBarPositionerConfig): this;
  config(): IStackedBarPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export const DEFAULT_STACKED_BAR_POSITIONER_CONFIG: IStackedBarPositionerConfig = {
  categories: [],
  categoryScale: { scale: bandScale(), domain: [], padding: 0.1 },
  values: [],
  valueScale: { scale: linearScale<number>(), domain: [] },
  orientation: BarOrientation.Vertical,
};

export class StackedBarPositioner implements IStackedBarPositioner {
  private _config: IStackedBarPositionerConfig;
  private _bars: Rect[] = [];

  constructor() {
    this._config = DEFAULT_STACKED_BAR_POSITIONER_CONFIG;
  }

  config(config: IStackedBarPositionerConfig): this;
  config(): IStackedBarPositionerConfig;
  config(config?: IStackedBarPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);

    this._config.categoryScale.domain = this._config.categories;
    applyBandScaleConfig(this._config.categoryScale);
    applyScaleConfig(this._config.valueScale);

    return this;
  }

  fitInSize(size: utils.ISize): this {
    const categoryScale = this._config.categoryScale.scale,
      valueScale = this._config.valueScale.scale;

    if (this._config.orientation === BarOrientation.Vertical) {
      categoryScale.range([0, size.width]);
      valueScale.range([size.height, 0]);
    } else if (this._config.orientation === BarOrientation.Horizontal) {
      categoryScale.range([0, size.height]);
      valueScale.range([0, size.width]);
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
            x: categoryScale(c)!,
            y: -sum + Math.min(valueScale(0)!, valueScale(v)!),
            width: categoryScale.bandwidth(),
            height: Math.abs(valueScale(0)! - valueScale(v)!),
          });
          sum += this._bars[this._bars.length - 1].height;
        } else if (this._config.orientation === BarOrientation.Horizontal) {
          this._bars.push({
            x: sum + Math.min(valueScale(0)!, valueScale(v)!),
            y: categoryScale(c)!,
            width: Math.abs(valueScale(0)! - valueScale(v)!),
            height: categoryScale.bandwidth(),
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
}

export function stackedBarPositioner(): StackedBarPositioner {
  return new StackedBarPositioner();
}
