import { range } from 'd3-array';
import {
  applyBandScaleConfig,
  applyScaleConfig,
  bandScale,
  IBandScaleConfig,
  IScaleConfig,
  linearScale,
  IRect,
  utils,
} from '../core';
import { BarOrientation, IBars } from './bars';

export interface IGroupedBarPositionerConfig {
  categories: string[];
  categoryScale: IBandScaleConfig;
  subcategoryScale: IBandScaleConfig;
  values: number[][];
  valueScale: IScaleConfig<number, number, number>;
  orientation: BarOrientation;
}

export interface IGroupedBarPositioner extends IBars {
  config(config: IGroupedBarPositionerConfig): this;
  config(): IGroupedBarPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export const DEFAULT_GROUPED_BAR_POSITIONER_CONFIG: IGroupedBarPositionerConfig = {
  categories: [],
  categoryScale: { scale: bandScale(), domain: [], padding: 0.1, nice: true },
  subcategoryScale: { scale: bandScale(), domain: [], padding: 0.1, nice: false },
  values: [],
  valueScale: { scale: linearScale<number>(), domain: [], nice: true },
  orientation: BarOrientation.Vertical,
};

export class GroupedBarPositioner implements IGroupedBarPositioner {
  private _config: IGroupedBarPositionerConfig;
  private _bars: IRect<number>[] = [];

  constructor() {
    this._config = DEFAULT_GROUPED_BAR_POSITIONER_CONFIG;
  }

  config(config: IGroupedBarPositionerConfig): this;
  config(): IGroupedBarPositionerConfig;
  config(config?: IGroupedBarPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);

    this._config.categoryScale.domain = this._config.categories;
    this._config.subcategoryScale.domain = range(this._config.values[0]?.length || 0);
    applyBandScaleConfig(this._config.categoryScale);
    applyBandScaleConfig(this._config.subcategoryScale);
    applyScaleConfig(this._config.valueScale);

    return this;
  }

  fitInSize(size: utils.ISize): this {
    const categoryScale = this._config.categoryScale.scale,
      subcategoriesScale = this._config.subcategoryScale.scale,
      valueScale = this._config.valueScale.scale;

    if (this._config.orientation === BarOrientation.Vertical) {
      categoryScale.range([0, size.width]);
      valueScale.range([size.height, 0]);
    } else if (this._config.orientation === BarOrientation.Horizontal) {
      categoryScale.range([0, size.height]);
      valueScale.range([0, size.width]);
    }
    subcategoriesScale.range([0, categoryScale.bandwidth()]);

    this._bars = [];

    for (let i = 0; i < this._config.values.length; ++i) {
      const subcategoryValues = this._config.values[i];
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._config.categories[i];
        const v = subcategoryValues[j];

        if (this._config.orientation === BarOrientation.Vertical) {
          this._bars.push({
            x: categoryScale(c)! + subcategoriesScale(j)!,
            y: Math.min(valueScale(0)!, valueScale(v)!),
            width: subcategoriesScale.bandwidth(),
            height: Math.abs(valueScale(0)! - valueScale(v)!),
          });
        } else if (this._config.orientation === BarOrientation.Horizontal) {
          this._bars.push({
            x: Math.min(valueScale(0)!, valueScale(v)!),
            y: categoryScale(c)! + subcategoriesScale(j)!,
            width: Math.abs(valueScale(0)! - valueScale(v)!),
            height: subcategoriesScale.bandwidth(),
          });
        }
      }
    }

    return this;
  }

  bars(): IRect<number>[] {
    return this._bars;
  }
}

export function groupedBarPositioner(): GroupedBarPositioner {
  return new GroupedBarPositioner();
}
