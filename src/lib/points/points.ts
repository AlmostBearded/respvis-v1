import { bandScale, linearScale, ScaleAny } from '../core';
import { IPosition, ISize } from '../core/utils';

export interface Points {
  xValues(): any[];
  xValues(values: any[]): this;
  xScale(): ScaleAny<string | number | Date, number, number>;
  xScale(scale: ScaleAny<string | number | Date, number, number>): this;
  yValues(): any[];
  yValues(values: any[]): this;
  yScale(): ScaleAny<string | number | Date, number, number>;
  yScale(scale: ScaleAny<string | number | Date, number, number>): this;
  radiuses(): any[];
  radiuses(values: any[]): this;
  radiusScale(): ScaleAny<string | number | Date, number, number>;
  radiusScale(scale: ScaleAny<string | number | Date, number, number>): this;
  points(): { center: IPosition; radius: number }[];
}

export class PointsCalculator implements Points {
  private _xValues: any[];
  private _xScale: ScaleAny<string | number | Date, number, number>;
  private _yValues: any[];
  private _yScale: ScaleAny<string | number | Date, number, number>;
  private _radiuses: any[];
  private _radiusScale: ScaleAny<string | number | Date, number, number>;
  private _points: { center: IPosition; radius: number }[];

  constructor() {
    this._xValues = [];
    this._xScale = bandScale();
    this._yValues = [];
    this._yScale = linearScale<number, number>();
    this._radiuses = [];
    this._radiusScale = linearScale<number, number>().domain([0, 1]).range([5, 10]);
    this._points = [];
  }

  xValues(): any[];
  xValues(values: any[]): this;
  xValues(values?: any) {
    if (values === undefined) return this._xValues;
    this._xValues = values;
    return this;
  }

  xScale(): ScaleAny<string | number | Date, number, number>;
  xScale(scale: ScaleAny<string | number | Date, number, number>): this;
  xScale(scale?: any) {
    if (scale === undefined) return this._xScale;
    this._xScale = scale;
    return this;
  }

  yValues(): any[];
  yValues(values: any[]): this;
  yValues(values?: any) {
    if (values === undefined) return this._yValues;
    this._yValues = values;
    return this;
  }

  yScale(): ScaleAny<string | number | Date, number, number>;
  yScale(scale: ScaleAny<string | number | Date, number, number>): this;
  yScale(scale?: any) {
    if (scale === undefined) return this._yScale;
    this._yScale = scale;
    return this;
  }

  radiuses(): any[];
  radiuses(values: any[]): this;
  radiuses(values?: any) {
    if (values === undefined) return this._radiuses;
    this._radiuses = values;
    return this;
  }

  radiusScale(): ScaleAny<string | number | Date, number, number>;
  radiusScale(scale: ScaleAny<string | number | Date, number, number>): this;
  radiusScale(scale?: any) {
    if (scale === undefined) return this._radiusScale;
    this._radiusScale = scale;
    return this;
  }

  points(): { center: IPosition; radius: number }[] {
    return this._points;
  }

  fitInSize(size: ISize): this {
    this._xScale.range([0, size.width]);
    this._yScale.range([size.height, 0]);

    this._points = [];

    for (let i = 0; i < this._xValues.length; ++i) {
      const x = this._xValues[i],
        y = this._yValues[i],
        r = this._radiuses[i] || 0;
      this._points.push({
        center: {
          x: this._xScale(x)!,
          y: this._yScale(y)!,
        },
        radius: this._radiusScale(r)!,
      });
    }

    return this;
  }
}

export function pointsCalculator(): PointsCalculator {
  return new PointsCalculator();
}

// export interface IPointPositioner extends IPoints {
//   config(config: IPointPositionerConfig): this;
//   config(): IPointPositionerConfig;
//   fitInSize(size: utils.ISize): this;
// }

// export class PointPositioner implements IPointPositioner {
//   private _config: IPointPositionerConfig;
//   private _points: utils.IPosition[] = [];

//   constructor() {
//     this._config = {
//       categories: [],
//       categoryScale: { scale: linearScale<number>(), domain: [] },
//       values: [],
//       valueScale: { scale: linearScale<number>(), domain: [] },
//     };
//   }

//   config(config: IPointPositionerConfig): this;
//   config(): IPointPositionerConfig;
//   config(config?: IPointPositionerConfig): any {
//     if (config === undefined) return this._config;
//     utils.deepExtend(this._config, config);
//     applyScaleConfig(this._config.categoryScale);
//     applyScaleConfig(this._config.valueScale);
//     return this;
//   }

//   fitInSize(size: utils.ISize): this {
//     this._config.categoryScale.scale.range([0, size.width]);
//     this._config.valueScale.scale.range([size.height, 0]);

//     this._points = [];

//     for (let i = 0; i < this._config.categories.length; ++i) {
//       const c = this._config.categories[i],
//         v = this._config.values[i];
//       this._points.push({
//         x: this._config.categoryScale.scale(c)!,
//         y: this._config.valueScale.scale(v)!,
//       });
//     }

//     return this;
//   }

//   points(): utils.IPosition[] {
//     return this._points;
//   }
// }

// export function pointPositioner(): PointPositioner {
//   return new PointPositioner();
// }
