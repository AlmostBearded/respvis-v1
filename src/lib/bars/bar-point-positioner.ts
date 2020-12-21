import { utils } from '../core';
import { IPoints } from '../points';
import { IBars } from './bars';

export enum HorizontalPosition {
  Left = 0,
  Center = 1,
  Right = 2,
}

export enum VerticalPosition {
  Top = 0,
  Center = 1,
  Bottom = 2,
}

export interface IBarPointPositionerConfig {
  bars?: IBars;
  horizontalPosition: HorizontalPosition;
  verticalPosition: VerticalPosition;
}

export interface IBarPointPositioner extends IPoints {
  config(config: IBarPointPositionerConfig): this;
  config(): IBarPointPositionerConfig;
}

export class BarPointPositioner implements IBarPointPositioner {
  private _config: IBarPointPositionerConfig;

  constructor() {
    this._config = {
      horizontalPosition: HorizontalPosition.Center,
      verticalPosition: VerticalPosition.Center,
    };
  }

  config(config: IBarPointPositionerConfig): this;
  config(): IBarPointPositionerConfig;
  config(config?: IBarPointPositionerConfig): any {
    if (config === undefined) return this._config;
    const bars = config.bars || this._config.bars;
    utils.deepExtend(this._config, config);
    this._config.bars = bars;
    return this;
  }

  points(): utils.IPosition[] {
    const bars = this._config.bars?.bars() || [];
    const sizePercents = [0, 0.5, 1];
    const points: utils.IPosition[] = [];
    for (let i = 0; i < bars.length; ++i) {
      points.push({
        x: bars[i].x + bars[i].width * sizePercents[this._config.horizontalPosition],
        y: bars[i].y + bars[i].height * sizePercents[this._config.verticalPosition],
      });
    }
    return points;
  }
}

export function barPointPositioner(): BarPointPositioner {
  return new BarPointPositioner();
}
