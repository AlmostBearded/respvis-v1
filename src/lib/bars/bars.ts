import { Component } from '../component';
import { nullFunction } from '../utils';
import { Selection, BaseType } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { max, merge } from 'd3-array';
import 'd3-transition';
import { Layout } from '../layout/layout';
import { Rect, RectPositioner } from '..';

export interface Bars extends Component {
  rectPositioner(rectPositioner?: RectPositioner): RectPositioner | Bars;
}

export function bars(): Bars {
  let _rectPositioner: RectPositioner;
  let _resize: (layout: Layout, transitionDuration: number) => void;
  let _render = (transitionDuration: number): void => {};

  const renderedBars: Bars = function renderedBars(
    selection: Selection<SVGElement, unknown, BaseType, unknown>
  ): void {
    console.assert(
      selection.node(),
      'Cannot render bars into an empty selection.'
    );
    _render = function (transitionDuration: number): void {
      // console.log("render bars");
      barsContainerSelection.call(
        renderBars,
        _rectPositioner.rects(),
        transitionDuration
      );
    };

    _resize = function (layout: Layout, transitionDuration: number): void {
      var layoutRect = layout.layoutOfElement(barsContainerSelection.node()!)!;
      // console.log('resize bars');
      // console.log(layoutRect);
      _rectPositioner.update(layoutRect);
      _render(transitionDuration);
    };

    const barsContainerSelection = selection.append('g').classed('bars', true);

    var boundingRect = selection.node()!.getBoundingClientRect();
    _rectPositioner.update(boundingRect);

    _render(0);
  };

  renderedBars.rectPositioner = function rectPositioner(
    rectPositioner?: RectPositioner
  ): RectPositioner | Bars {
    if (!arguments.length) return _rectPositioner;
    console.assert(rectPositioner, 'Bars require a valid rect positioner!');
    _rectPositioner = rectPositioner!;
    return renderedBars;
  };

  renderedBars.resize = function resize(
    layout: Layout,
    transitionDuration: number
  ): void {
    _resize(layout, transitionDuration);
  };

  renderedBars.render = function render(transitionDuration: number): void {
    _render(transitionDuration);
  };

  return renderedBars;
}

function renderBars(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  bars: Rect[],
  transitionDuration: number
): void {
  selection
    .selectAll('rect')
    .data(bars)
    .join('rect')
    .classed('bar', true)
    .transition()
    .duration(transitionDuration)
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('height', (d) => d.height)
    .attr('width', (d) => d.width);
}
