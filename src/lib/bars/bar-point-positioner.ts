import { IBarPositioner } from './bar-positioner';
import { Size } from '../utils';

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

export type Point = { x: number; y: number };

export interface IPointPositioner {
  fitInSize(size: Size): this;
  points(): Point[];
}

export interface IBarPointPositioner extends IPointPositioner {
  bars(bars: IBarPositioner): this;
  bars(): IBarPositioner;
  horizontalPosition(position: HorizontalPosition): this;
  horizontalPosition(): HorizontalPosition;
  verticalPosition(position: VerticalPosition): this;
  verticalPosition(): VerticalPosition;
}

export class BarPointPositioner implements IBarPointPositioner {
  private _bars: IBarPositioner;
  private _horizontalPosition: HorizontalPosition = HorizontalPosition.Center;
  private _verticalPosition: VerticalPosition = VerticalPosition.Center;
  private _points: Point[] = [];

  bars(bars?: IBarPositioner): any {
    if (bars === undefined) return this._bars;
    this._bars = bars;
    return this;
  }

  horizontalPosition(position?: HorizontalPosition): any {
    if (position === undefined) return this._horizontalPosition;
    this._horizontalPosition = position;
    return this;
  }

  verticalPosition(position?: VerticalPosition): any {
    if (position === undefined) return this._verticalPosition;
    this._verticalPosition = position;
    return this;
  }

  fitInSize(size: Size): this {
    // TODO: Does/should this be done all the time?
    this._bars.fitInSize(size);

    this._points = [];
    const rects = this._bars.bars();
    const sizePercents = [0, 0.5, 1];
    for (let i = 0; i < rects.length; ++i) {
      this._points.push({
        x: rects[i].x + rects[i].width * sizePercents[this._horizontalPosition],
        y: rects[i].y + rects[i].height * sizePercents[this._verticalPosition],
      });
    }
    return this;
  }

  points(): Point[] {
    return this._points;
  }
}

export function barPointPositioner(): BarPointPositioner {
  return new BarPointPositioner();
}
