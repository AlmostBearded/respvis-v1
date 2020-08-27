import { RectPositioner } from '.';
import { Size } from './utils';

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

export interface PointPositioner<T> {
  update(size: Size): T;
  points(): Point[];
}

export interface RectPointPositioner
  extends PointPositioner<RectPointPositioner> {
  rectPositioner(
    rectPositioner?: RectPositioner
  ): RectPositioner | RectPointPositioner;
  horizontalPosition(
    position?: HorizontalPosition
  ): HorizontalPosition | RectPointPositioner;
  verticalPosition(
    position?: VerticalPosition
  ): VerticalPosition | RectPointPositioner;
}

export function rectPointPositioner(): RectPointPositioner {
  let _rectPositioner: RectPositioner;
  let _horizontalPosition: HorizontalPosition = HorizontalPosition.Center;
  let _verticalPosition: VerticalPosition = VerticalPosition.Center;
  let _points: Point[] = [];

  const rectPointPositioner: RectPointPositioner = {
    rectPositioner(
      rectPositioner?: RectPositioner
    ): RectPositioner | RectPointPositioner {
      if (!arguments.length) return _rectPositioner;
      console.assert(
        rectPositioner,
        'Rect point positioner requires a valid rect positioner'
      );
      _rectPositioner = rectPositioner!;
      return rectPointPositioner;
    },
    horizontalPosition(
      position?: HorizontalPosition
    ): HorizontalPosition | RectPointPositioner {
      if (!arguments.length) return _horizontalPosition;
      _horizontalPosition = position || HorizontalPosition.Center;
      return rectPointPositioner;
    },
    verticalPosition(
      position?: VerticalPosition
    ): VerticalPosition | RectPointPositioner {
      if (!arguments.length) return _verticalPosition;
      _verticalPosition = position || VerticalPosition.Center;
      return rectPointPositioner;
    },
    update(size: Size): RectPointPositioner {
      _rectPositioner.update(size);

      _points = [];
      const rects = _rectPositioner.rects();
      const sizePercents = [0, 0.5, 1];
      for (let i = 0; i < rects.length; ++i) {
        _points.push({
          x: rects[i].x + rects[i].width * sizePercents[_horizontalPosition],
          y: rects[i].y + rects[i].height * sizePercents[_verticalPosition],
        });
      }
      return rectPointPositioner;
    },
    points(): Point[] {
      return _points;
    },
  };
  return rectPointPositioner;
}
