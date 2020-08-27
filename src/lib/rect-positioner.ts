import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from 'd3-scale';
import { max, Primitive } from 'd3-array';

export enum Orientation {
  Vertical,
  Horizontal,
}

export type Rect = { x: number; y: number; width: number; height: number };

export interface RectPositioner {
  categories(categories?: Primitive[]): Primitive[] | RectPositioner;
  values(values?: number[][]): number[][] | RectPositioner;
  orientation(orientation?: Orientation): Orientation | RectPositioner;
  flipCategories(flip?: boolean): boolean | RectPositioner;
  flipValues(flip?: boolean): boolean | RectPositioner;
  categoryPadding(padding?: number): number | RectPositioner;
  //   subcategoryPadding(padding?: number): number | RectPositioner;
  //   stack(stack?: boolean): boolean | RectPositioner;
  rects(size: { width: number; height: number }): Rect[];
  categoriesScale(): ScaleBand<Primitive>;
  valuesScale(): ScaleLinear<number, number>;
}

export function rectPositioner(): RectPositioner {
  let _categories: Primitive[] = [];
  let _values: number[][] = [];
  let _orientation: Orientation = Orientation.Vertical;
  let _categoryPadding: number = 0;
  let _flipValues: boolean = false;
  let _flipCategories: boolean = false;
  let _categoriesScale: ScaleBand<Primitive> = scaleBand();
  let _valuesScale: ScaleLinear<number, number> = scaleLinear();

  let rectPositioner: RectPositioner = {
    categories(categories?: Primitive[]): Primitive[] | RectPositioner {
      if (!arguments.length) return _categories;
      _categories = categories || [];
      return rectPositioner;
    },
    values(values?: number[][]): number[][] | RectPositioner {
      if (!arguments.length) return _values;
      _values = values || [];
      return rectPositioner;
    },
    orientation(orientation?: Orientation): Orientation | RectPositioner {
      if (!arguments.length) return _orientation;
      _orientation = orientation || Orientation.Vertical;
      return rectPositioner;
    },
    categoryPadding(padding?: number): number | RectPositioner {
      if (!arguments.length) return _categoryPadding;
      _categoryPadding = padding || 0;
      return rectPositioner;
    },
    flipCategories(flip?: boolean): boolean | RectPositioner {
      if (!arguments.length) return _flipCategories;
      _flipCategories = flip || false;
      return rectPositioner;
    },
    flipValues(flip?: boolean): boolean | RectPositioner {
      if (!arguments.length) return _flipValues;
      _flipValues = flip || false;
      return rectPositioner;
    },
    rects(size: { width: number; height: number }): Rect[] {
      _categoriesScale.domain(_categories).padding(_categoryPadding);
      _valuesScale.domain([0, max(_values.map((v) => max(v)!))!]);

      if (_orientation === Orientation.Vertical) {
        _categoriesScale.range(
          _flipCategories ? [size.width, 0] : [0, size.width]
        );
        _valuesScale.range(_flipValues ? [0, size.height] : [size.height, 0]);
      } else if (_orientation === Orientation.Horizontal) {
        _categoriesScale.range(
          _flipCategories ? [size.height, 0] : [0, size.height]
        );
        _valuesScale.range(_flipValues ? [size.width, 0] : [0, size.width]);
      }

      let rects: Rect[] = [];
      for (let i = 0; i < _values.length; ++i) {
        const values = _values[i];
        for (let j = 0; j < values.length; ++j) {
          const c = _categories[j];
          const v = values[j];

          if (_orientation === Orientation.Vertical) {
            rects.push({
              x: _categoriesScale(c)!,
              y: Math.min(_valuesScale(0), _valuesScale(v)),
              width: _categoriesScale.bandwidth(),
              height: Math.abs(_valuesScale(0) - _valuesScale(v)),
            });
          } else if (_orientation === Orientation.Horizontal) {
            rects.push({
              x: Math.min(_valuesScale(0), _valuesScale(v)),
              y: _categoriesScale(c)!,
              width: Math.abs(_valuesScale(0) - _valuesScale(v)),
              height: _categoriesScale.bandwidth(),
            });
          }
        }
      }
      return rects;
    },
    categoriesScale(): ScaleBand<Primitive> {
      return _categoriesScale;
    },
    valuesScale(): ScaleLinear<number, number> {
      return _valuesScale;
    },
  };
  return rectPositioner;
}
