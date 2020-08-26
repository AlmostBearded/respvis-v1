import { Component } from '../component';
import { nullFunction } from '../utils';
import { Selection, BaseType } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { max, merge } from 'd3-array';
import 'd3-transition';
import { Layout } from '../layout/layout';

export enum Orientation {
  Vertical,
  Horizontal,
}

type BarsData = [string, number][];

export interface Bars extends Component {
  categories(categories?: string[]): string[] | Bars;
  values(values?: number[]): number[] | Bars;
  padding(padding?: number, transitionDuration?: number): number | Bars;
  orientation(
    orientation?: Orientation,
    transitionDuration?: number
  ): Orientation | Bars;
  categoriesScale(): ScaleBand<string>;
  valuesScale(): ScaleLinear<number, number>;
  flipValues(flip?: boolean): boolean | Bars;
}

export function bars(): Bars {
  let _categories: Array<string> = [];
  let _values: Array<number> = [];
  let _padding: number = 0;
  let _orientation: Orientation = Orientation.Vertical;
  let _categoriesScale: ScaleBand<string> = scaleBand();
  let _valuesScale: ScaleLinear<number, number> = scaleLinear();
  let _flipValues: boolean = false;
  let _flipCategories: boolean = false;
  let _updateCategories = nullFunction;
  let _updateValues = nullFunction;
  let _updatePadding = (transitionDuration: number): void => {};
  let _updateOrientation = (transitionDuration: number): void => {};
  let _updateFlipValues = nullFunction;
  let _updateFlipCategories = nullFunction;
  let _resize: (layout: Layout, transitionDuration: number) => void;

  function renderedBars(
    selection: Selection<SVGElement, unknown, BaseType, unknown>
  ): void {
    _categoriesScale.domain(_categories).padding(_padding);
    _valuesScale.domain([0, max(_values)!]);

    console.assert(
      selection.node(),
      'Cannot render bars into an empty selection.'
    );
    var boundingRect = selection.node()!.getBoundingClientRect();
    if (_orientation === Orientation.Vertical) {
      _categoriesScale.range(
        _flipCategories ? [boundingRect.width, 0] : [0, boundingRect.width]
      );
      _valuesScale.range(
        _flipValues ? [0, boundingRect.height] : [boundingRect.height, 0]
      );
    } else if (_orientation === Orientation.Horizontal) {
      _categoriesScale.range(
        _flipCategories ? [boundingRect.height, 0] : [0, boundingRect.height]
      );
      _valuesScale.range(
        _flipValues ? [boundingRect.width, 0] : [0, boundingRect.width]
      );
    }

    const barsContainerSelection = selection.append('g').classed('bars', true);
    renderBars(0);

    function renderBars(transitionDuration: number): void {
      // console.log(`renderBars(${transitionDuration})`);

      const mergedData: BarsData = _categories.map((category, index) => [
        category,
        _values[index],
      ]);

      const renderFunction =
        _orientation === Orientation.Vertical
          ? renderVerticalBars
          : renderHorizontalBars;

      barsContainerSelection.call(
        renderFunction,
        mergedData,
        _categoriesScale,
        _valuesScale,
        transitionDuration
      );
    }

    _resize = function (layout: Layout, transitionDuration: number): void {
      // console.log(`resizeBars`);

      var layoutRect = layout.layoutOfElement(barsContainerSelection.node()!)!;
      if (_orientation === Orientation.Vertical) {
        _categoriesScale.range(
          _flipCategories ? [layoutRect.width, 0] : [0, layoutRect.width]
        );
        _valuesScale.range(
          _flipValues ? [0, layoutRect.height] : [layoutRect.height, 0]
        );
      } else if (_orientation === Orientation.Horizontal) {
        _categoriesScale.range(
          _flipCategories ? [layoutRect.height, 0] : [0, layoutRect.height]
        );
        _valuesScale.range(
          _flipValues ? [layoutRect.width, 0] : [0, layoutRect.width]
        );
      }

      renderBars(transitionDuration);
    };

    _updateCategories = function (): void {};
    _updateValues = function (): void {};
    _updatePadding = function (transitionDuration: number): void {
      _categoriesScale.padding(_padding);
      renderBars(transitionDuration);
    };
    _updateOrientation = function (transitionDuration: number): void {
      // console.log(`updateBarsOrientation(${transitionDuration})`);
      renderBars(transitionDuration);
    };
    _updateFlipValues = function (): void {
      const r = _valuesScale.range(),
        max = Math.max(...r),
        min = Math.min(...r);
      if (_orientation === Orientation.Vertical) {
        _valuesScale.range(_flipValues ? [min, max] : [max, min]);
      } else if (_orientation === Orientation.Horizontal) {
        _valuesScale.range(_flipValues ? [max, min] : [min, max]);
      }
      renderBars(0);
    };
    _updateFlipCategories = function (): void {
      const r = _categoriesScale.range(),
        max = Math.max(...r),
        min = Math.min(...r);
      if (_orientation === Orientation.Vertical) {
        _categoriesScale.range(_flipValues ? [max, min] : [min, max]);
      } else if (_orientation === Orientation.Horizontal) {
        _categoriesScale.range(_flipValues ? [max, min] : [min, max]);
      }
      renderBars(0);
    };
  }

  renderedBars.categories = function categories(
    categories?: string[]
  ): string[] | Bars {
    if (!arguments.length) return _categories;
    _categories = categories || [];
    _updateCategories();
    return renderedBars;
  };

  renderedBars.values = function values(values?: number[]): number[] | Bars {
    if (!arguments.length) return _values;
    _values = values || [];
    _updateValues();
    return renderedBars;
  };

  renderedBars.padding = function padding(
    padding?: number,
    transitionDuration?: number
  ): number | Bars {
    if (!arguments.length) return _padding;
    _padding = padding || 0;
    _updatePadding(transitionDuration!);
    return renderedBars;
  };

  renderedBars.orientation = function orientation(
    orientation?: Orientation,
    transitionDuration?: number
  ): Orientation | Bars {
    if (!arguments.length) return _orientation;
    _orientation = orientation || Orientation.Vertical;
    _updateOrientation(transitionDuration!);
    return renderedBars;
  };

  renderedBars.categoriesScale = function categoriesScale(): ScaleBand<string> {
    return _categoriesScale;
  };

  renderedBars.valuesScale = function valuesScale(): ScaleLinear<
    number,
    number
  > {
    return _valuesScale;
  };

  renderedBars.flipValues = function flipValues(
    flip?: boolean
  ): boolean | Bars {
    if (!arguments.length) return _flipValues;
    _flipValues = flip || false;
    _updateFlipValues();
    return renderedBars;
  };

  renderedBars.flipCategories = function flipCategories(
    flip?: boolean
  ): boolean | Bars {
    if (!arguments.length) return _flipCategories;
    _flipCategories = flip || false;
    _updateFlipCategories();
    return renderedBars;
  };

  renderedBars.resize = function resize(
    layout: Layout,
    transitionDuration: number
  ): void {
    _resize(layout, transitionDuration);
  };

  return renderedBars;
}

function renderVerticalBars(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  data: BarsData,
  bandScale: ScaleBand<string>,
  linearScale: ScaleLinear<number, number>,
  transitionDuration: number
): void {
  selection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .transition()
    .duration(transitionDuration)
    .attr('x', (d) => bandScale(d[0])!)
    .attr('y', (d) => Math.min(linearScale(d[1]), linearScale(0)))
    .attr('height', (d) => Math.abs(linearScale(0) - linearScale(d[1])))
    .attr('width', bandScale.bandwidth());
}

function renderHorizontalBars(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  data: BarsData,
  bandScale: ScaleBand<string>,
  linearScale: ScaleLinear<number, number>,
  transitionDuration: number
): void {
  selection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .transition()
    .duration(transitionDuration)
    .attr('x', (d) => Math.min(linearScale(0), linearScale(d[1])))
    .attr('y', (d) => bandScale(d[0])!)
    .attr('height', bandScale.bandwidth())
    .attr('width', (d) => Math.abs(linearScale(d[1]) - linearScale(0)));
}
