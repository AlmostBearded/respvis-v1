import { chainedTransition } from '../transition';
import { nullFunction } from '../utils';
import { Selection } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { max } from 'd3-array';

export function renderVerticalBars(selection, data, bandScale, linearScale, transitionDuration) {
  selection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .each(function (d) {
      chainedTransition(this)
        .duration(transitionDuration)
        .attr('x', bandScale(d.bandScaleValue))
        .attr('y', linearScale(d.linearScaleValue))
        .attr('height', linearScale(0) - linearScale(d.linearScaleValue))
        .attr('width', bandScale.bandwidth());
    });
}

export function renderHorizontalBars(selection, data, bandScale, linearScale, transitionDuration) {
  selection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .each(function (d) {
      chainedTransition(this)
        .duration(transitionDuration)
        .attr('x', linearScale(0))
        .attr('y', bandScale(d.bandScaleValue))
        .attr('height', bandScale.bandwidth())
        .attr('width', linearScale(d.linearScaleValue));
    });
}

enum Orientation {
  Vertical = 'Vertical',
  Horizontal = 'Horizontal',
}

export function bars() {
  let _categories: Array<string> = [];
  let _values: Array<number> = [];
  let _padding: number = 0;
  let _orientation: Orientation = Orientation.Vertical;
  let _categoriesScale: ScaleBand<string>;
  let _valuesScale: ScaleLinear<number, number>;
  let _updateCategories = nullFunction;
  let _updateValues = nullFunction;
  let _updatePadding = nullFunction;
  let _updateOrientation = nullFunction;

  function renderedBars(selection: Selection<SVGElement, unknown, HTMLElement, unknown>) {
    _categoriesScale = scaleBand().domain(_categories).padding(_padding);
    _valuesScale = scaleLinear().domain([0, max(_values)!]);

    console.assert(selection.node(), 'Cannot render bars into an empty selection.');
    var boundingRect = selection.node()!.getBoundingClientRect();
    if (_orientation === Orientation.Vertical) {
      _categoriesScale.range([0, boundingRect.width]);
      _valuesScale.range([boundingRect.height, 0]);
    } else if (_orientation === Orientation.Horizontal) {
      _categoriesScale.range([0, boundingRect.height]);
      _valuesScale.range([0, boundingRect.width]);
    }

    const barsContainerSelection = selection.append('g').classed('bars', true);

    const mergedData: [string, number][] = _categories.map((category, index) => [
      category,
      _values[index],
    ]);

    const barsSelection = barsContainerSelection
      .selectAll<SVGRectElement, [string, number][]>('rect')
      .data(mergedData)
      .join('rect')
      .classed('bar', true)
      .transition()
      .duration(0)
      .attr('x', (d) => _categoriesScale(d[0])!)
      .attr('y', (d) => _valuesScale(d[1]))
      .attr('height', (d) => _valuesScale(0) - _valuesScale(d[1]))
      .attr('width', (d) => _categoriesScale.bandwidth());

    _updateCategories = function () {};
    _updateValues = function () {};
    _updatePadding = function () {};
    _updateOrientation = function () {};
  }

  renderedBars.categories = function categories(categories?: Array<string>) {
    if (!arguments.length) return _categories;
    _categories = categories || [];
    _updateCategories();
    return renderedBars;
  };

  renderedBars.values = function values(values?: Array<number>) {
    if (!arguments.length) return _values;
    _values = values || [];
    _updateValues();
    return renderedBars;
  };

  renderedBars.padding = function padding(padding?: number) {
    if (!arguments.length) return _padding;
    _padding = padding || 0;
    _updatePadding();
    return renderedBars;
  };

  renderedBars.orientation = function orientation(orientation?: Orientation) {
    if (!arguments.length) return _orientation;
    _orientation = orientation || Orientation.Vertical;
    _updateOrientation();
    return renderedBars;
  };

  return renderedBars;
}
