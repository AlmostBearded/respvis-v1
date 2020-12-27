import { applyScaleConfig, IScaleConfig, linearScale, utils } from '../core';

export interface IPoints {
  points(): utils.IPosition[];
}

export interface IPointPositionerConfig {
  categories: any[];
  categoryScale: IScaleConfig<any, number, number>;
  values: number[];
  valueScale: IScaleConfig<number, number, number>;
}

export interface IPointPositioner extends IPoints {
  config(config: IPointPositionerConfig): this;
  config(): IPointPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export class PointPositioner implements IPointPositioner {
  private _config: IPointPositionerConfig;
  private _points: utils.IPosition[] = [];

  constructor() {
    this._config = {
      categories: [],
      categoryScale: { scale: linearScale<number>(), domain: [] },
      values: [],
      valueScale: { scale: linearScale<number>(), domain: [] },
    };
  }

  config(config: IPointPositionerConfig): this;
  config(): IPointPositionerConfig;
  config(config?: IPointPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);
    applyScaleConfig(this._config.categoryScale);
    applyScaleConfig(this._config.valueScale);
    return this;
  }

  fitInSize(size: utils.ISize): this {
    this._config.categoryScale.scale.range([0, size.width]);
    this._config.valueScale.scale.range([size.height, 0]);

    this._points = [];

    for (let i = 0; i < this._config.categories.length; ++i) {
      const c = this._config.categories[i],
        v = this._config.values[i];
      this._points.push({
        x: this._config.categoryScale.scale(c)!,
        y: this._config.valueScale.scale(v)!,
      });
    }

    return this;
  }

  points(): utils.IPosition[] {
    return this._points;
  }
}

export function pointPositioner(): PointPositioner {
  return new PointPositioner();
}
