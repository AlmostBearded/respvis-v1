import { IPosition } from '../core/utils';
import { Bars } from './bars';

export interface BarPoints {
  bars(): Bars;
  bars(bars: Bars): this;
  widthPercent(): number;
  widthPercent(percent: number): this;
  heightPercent(): number;
  heightPercent(percent: number): this;
  points(): IPosition[];
}

export class BarPointsCalculator implements BarPoints {
  private _bars: Bars;
  private _heightPercent: number;
  private _widthPercent: number;
  private _points: IPosition[];

  constructor(bars: Bars) {
    this._bars = bars;
    this._heightPercent = 0.5;
    this._widthPercent = 0.5;
    this._points = [];
  }

  bars(): Bars;
  bars(bars: Bars): this;
  bars(bars?: any) {
    if (bars === undefined) return this._bars;
    this._bars = bars;
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
    const bars = this._bars.bars();
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
