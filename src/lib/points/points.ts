import { bandScale, linearScale, ScaleAny } from '../core';
import { IPosition, ISize } from '../core/utils';

export interface Points {
  mainValues(): any[];
  mainValues(values: any[]): this;
  mainScale(): ScaleAny<string | number | Date, number, number>;
  mainScale(scale: ScaleAny<string | number | Date, number, number>): this;
  crossValues(): any[];
  crossValues(values: any[]): this;
  crossScale(): ScaleAny<string | number | Date, number, number>;
  crossScale(scale: ScaleAny<string | number | Date, number, number>): this;
  radiuses(): any[];
  radiuses(values: any[]): this;
  radiusScale(): ScaleAny<string | number | Date, number, number>;
  radiusScale(scale: ScaleAny<string | number | Date, number, number>): this;
  points(): { center: IPosition; radius: number }[];
}

export class PointsCalculator implements Points {
  private _mainValues: any[];
  private _mainScale: ScaleAny<string | number | Date, number, number>;
  private _crossValues: any[];
  private _crossScale: ScaleAny<string | number | Date, number, number>;
  private _radiuses: any[];
  private _radiusScale: ScaleAny<string | number | Date, number, number>;
  private _points: { center: IPosition; radius: number }[];

  constructor() {
    this._mainValues = [];
    this._mainScale = bandScale();
    this._crossValues = [];
    this._crossScale = linearScale<number, number>();
    this._radiuses = [];
    this._radiusScale = linearScale<number, number>().domain([0, 1]).range([5, 10]);
    this._points = [];
  }

  mainValues(): any[];
  mainValues(values: any[]): this;
  mainValues(values?: any) {
    if (values === undefined) return this._mainValues;
    this._mainValues = values;
    return this;
  }

  mainScale(): ScaleAny<string | number | Date, number, number>;
  mainScale(scale: ScaleAny<string | number | Date, number, number>): this;
  mainScale(scale?: any) {
    if (scale === undefined) return this._mainScale;
    this._mainScale = scale;
    return this;
  }

  crossValues(): any[];
  crossValues(values: any[]): this;
  crossValues(values?: any) {
    if (values === undefined) return this._crossValues;
    this._crossValues = values;
    return this;
  }

  crossScale(): ScaleAny<string | number | Date, number, number>;
  crossScale(scale: ScaleAny<string | number | Date, number, number>): this;
  crossScale(scale?: any) {
    if (scale === undefined) return this._crossScale;
    this._crossScale = scale;
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
    this._mainScale.range([0, size.width]);
    this._crossScale.range([size.height, 0]);

    this._points = [];

    for (let i = 0; i < this._mainValues.length; ++i) {
      const x = this._mainValues[i],
        y = this._crossValues[i],
        r = this._radiuses[i] || 0;
      this._points.push({
        center: {
          x: this._mainScale(x)!,
          y: this._crossScale(y)!,
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
