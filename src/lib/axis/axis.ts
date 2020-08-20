import { Selection, select } from 'd3-selection';
import { axisLeft, axisBottom, axisTop, axisRight, AxisScale, Axis } from 'd3-axis';
import { nullFunction } from '../utils';
import { Component } from '../component';

export enum Position {
  Left,
  Bottom,
  Top,
  Right,
}

const classByPosition = new Map<Position, string>();
classByPosition.set(Position.Left, 'left-axis');
classByPosition.set(Position.Bottom, 'bottom-axis');
classByPosition.set(Position.Top, 'top-axis');
classByPosition.set(Position.Right, 'right-axis');

const axisFunctionByPosition = new Map<Position, (scale: AxisScale<unknown>) => Axis<unknown>>();
axisFunctionByPosition.set(Position.Left, axisLeft);
axisFunctionByPosition.set(Position.Bottom, axisBottom);
axisFunctionByPosition.set(Position.Top, axisTop);
axisFunctionByPosition.set(Position.Right, axisRight);

export function axis(): Component {
  let _scale: AxisScale<unknown>;
  let _position: Position = Position.Left;
  let _title: string = '';
  let _updateScale = nullFunction;
  let _updatePosition = nullFunction;
  let _updateTitle = nullFunction;
  let _resize = nullFunction;

  function renderedAxis(selection: Selection<SVGElement, unknown, HTMLElement, unknown>) {
    const axisSelection = selection.append('g').classed('axis', true);
    const titleSelection = axisSelection.append('text').classed('title', true).text(_title);
    const ticksSelection = axisSelection.append('g').classed('ticks', true);

    axisSelection.classed(classByPosition.get(_position)!, true);

    renderTicks();

    function renderTicks() {
      ticksSelection
        .call(axisFunctionByPosition.get(_position)!(_scale))
        .attr('font-size', null)
        .attr('font-family', null)
        .attr('text-anchor', null)
        .attr('fill', null)
        .call((ticksSelection) => ticksSelection.selectAll('text').attr('dy', null))
        .call((ticksSelection) => ticksSelection.select('.domain').attr('stroke', null))
        .call((ticksSelection) =>
          ticksSelection
            .selectAll('.tick')
            .attr('opacity', null)
            .call((tick) => tick.select('line').attr('stroke', null))
            .call((tick) => tick.select('text').attr('fill', null))
        );
    }

    _resize = function () {
      renderTicks();
    };
    _updateScale = function () {};
    _updatePosition = function () {};
    _updateTitle = function () {};
  }

  renderedAxis.scale = function scale(scale?: AxisScale<unknown>) {
    if (!arguments.length) return _scale;
    console.assert(scale, 'Cannot set scale to an invalid value');
    _scale = scale!;
    _updateScale();
    return renderedAxis;
  };

  renderedAxis.position = function position(position?: Position) {
    if (!arguments.length) return _position;
    _position = position || Position.Left;
    _updatePosition();
    return renderedAxis;
  };

  renderedAxis.title = function title(title?: string) {
    if (!arguments.length) return _title;
    _title = title || '';
    _updateTitle();
    return renderedAxis;
  };

  renderedAxis.resize = function resize(): void {
    _resize();
  };

  return renderedAxis;
}
