import { Selection, select, BaseType } from 'd3-selection';
import {
  axisLeft,
  axisBottom,
  axisTop,
  axisRight,
  AxisScale,
  Axis as D3Axis,
} from 'd3-axis';
import { IComponent } from '../component';
import { ILayout } from '../layout/layout';

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

const axisFunctionByPosition = new Map<
  Position,
  (scale: AxisScale<unknown>) => D3Axis<unknown>
>();
axisFunctionByPosition.set(Position.Left, axisLeft);
axisFunctionByPosition.set(Position.Bottom, axisBottom);
axisFunctionByPosition.set(Position.Top, axisTop);
axisFunctionByPosition.set(Position.Right, axisRight);

export interface IAxis extends IComponent {
  title(title?: string): string | this;
  position(position?: Position): Position | this;
  scale(scale?: AxisScale<unknown>): AxisScale<unknown> | this;
}

export class Axis implements IAxis {
  private _scale: AxisScale<unknown>;
  private _position: Position = Position.Left;
  private _title: string = '';
  private _axisSelection: Selection<SVGElement, unknown, BaseType, unknown>;

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._axisSelection = selection
      .append('g')
      .classed('axis', true)
      .classed(classByPosition.get(this._position)!, true);
    this.render(0);
    return this;
  }

  scale(scale?: AxisScale<unknown>): AxisScale<unknown> | this {
    if (!arguments.length) return this._scale;
    console.assert(scale, 'Axis requires a valid scale!');
    this._scale = scale!;
    // TODO: Update scale if called after creation
    return this;
  }

  position(position?: Position): Position | this {
    if (!arguments.length) return this._position;
    const newPosition = position || Position.Left;

    if (this._axisSelection) {
      this._axisSelection
        .classed(classByPosition.get(this._position)!, false)
        .classed(classByPosition.get(newPosition)!, true)
        .call(clearTickAttributes);
    }

    this._position = newPosition;

    return this;
  }

  title(title?: string): string | this {
    if (!arguments.length) return this._title;
    this._title = title || '';
    // TODO: Update title if called after creation
    return this;
  }

  render(transitionDuration: number): this {
    this._axisSelection.call(renderTitle, this._title);
    switch (this._position) {
      case Position.Bottom:
        this._axisSelection.call(renderBottomTicks, this._scale);
        break;
      case Position.Left:
        this._axisSelection.call(renderLeftTicks, this._scale);
        break;
      case Position.Top:
        this._axisSelection.call(renderTopTicks, this._scale);
        break;
      case Position.Right:
        this._axisSelection.call(renderRightTicks, this._scale);
        break;
    }

    return this;
  }

  fitInLayout(layout: ILayout): this {
    // TODO: Maybe this should be refactored somehow?
    // Possibly a separate IDynamicSizedComponent component?
    return this;
  }
}

export function axis(): Axis {
  return new Axis();
}

function renderTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  position: Position,
  scale: AxisScale<unknown>
): void {
  selection
    .selectAll('.ticks')
    .data([null])
    .join('g')
    .classed('ticks', true)
    .call(axisFunctionByPosition.get(position)!(scale))
    .attr('font-size', null)
    .attr('font-family', null)
    .attr('text-anchor', null)
    .attr('fill', null)
    .call((ticksSelection) => ticksSelection.selectAll('text').attr('dy', null))
    .call((ticksSelection) =>
      ticksSelection.select('.domain').attr('stroke', null)
    )
    .call((ticksSelection) =>
      ticksSelection
        .selectAll('.tick')
        .attr('opacity', null)
        .call((tick) => tick.select('line').attr('stroke', null))
        .call((tick) => tick.select('text').attr('fill', null))
    );
}

function renderLeftTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Left, scale)
    .selectAll('.ticks')
    .call(function (
      ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>
    ) {
      var boundingRect = ticksSelection.node()!.getBoundingClientRect();
      ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
    });
}

function renderBottomTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection.call(renderTicks, Position.Bottom, scale);
}

function renderTopTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Top, scale)
    .selectAll('.ticks')
    .call(function (
      ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>
    ) {
      var boundingRect = ticksSelection.node()!.getBoundingClientRect();
      ticksSelection.attr('transform', `translate(0, ${boundingRect.height})`);
    });
}

function renderRightTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection.call(renderTicks, Position.Right, scale);
}

function clearTickAttributes(
  selection: Selection<SVGElement, unknown, BaseType, unknown>
): void {
  selection
    .select('.ticks')
    .attr('transform', 'translate(0, 0)')
    .call(function (ticksSelection) {
      ticksSelection.selectAll('line').attr('x2', 0).attr('y2', 0);
    })
    .call(function (ticksSelection) {
      ticksSelection.selectAll('text').attr('x', 0).attr('y', 0);
    });
}

function renderTitle(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  title: string
) {
  selection
    .selectAll('.title')
    .data([null])
    .join('text')
    .classed('title', true)
    .text(title);
}
