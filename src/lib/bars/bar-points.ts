import { Rect } from '../core';
import { IPosition } from '../core/utils';
import { Bars } from './bars';

export interface BarPoints {
  barsAccessor(): BarsAccessor;
  barsAccessor(accessor: BarsAccessor): this;
  widthPercent(): number;
  widthPercent(percent: number): this;
  heightPercent(): number;
  heightPercent(percent: number): this;
  points(): IPosition[];
}

export type BarsAccessor = () => Rect<number>[];

export class BarPointsCalculator implements BarPoints {
  private _barsAccessor: BarsAccessor;
  private _heightPercent: number;
  private _widthPercent: number;
  private _points: IPosition[];

  constructor(barsAccessor: BarsAccessor) {
    this._barsAccessor = barsAccessor;
    this._heightPercent = 0.5;
    this._widthPercent = 0.5;
    this._points = [];
  }

  barsAccessor(): BarsAccessor;
  barsAccessor(accessor: BarsAccessor): this;
  barsAccessor(accessor?: BarsAccessor): BarsAccessor | this {
    if (accessor === undefined) return this._barsAccessor;
    this._barsAccessor = accessor;
    return this;
  }

  heightPercent(): number;
  heightPercent(percent: number): this;
  heightPercent(percent?: any) {
    if (percent === undefined) return this._heightPercent;
    this._heightPercent = percent;
    return this;
  }

  widthPercent(): number;
  widthPercent(percent: number): this;
  widthPercent(percent?: any) {
    if (percent === undefined) return this._widthPercent;
    this._widthPercent = percent;
    return this;
  }

  points(): IPosition[] {
    const bars = this._barsAccessor();
    const points: IPosition[] = [];
    for (let i = 0; i < bars.length; ++i) {
      points.push({
        x: bars[i].x + bars[i].width * this._widthPercent,
        y: bars[i].y + bars[i].height * (1 - this._heightPercent),
      });
    }
    return points;
  }
}
