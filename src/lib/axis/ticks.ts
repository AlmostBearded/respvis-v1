import { AxisScale, Axis, axisLeft, axisBottom, axisTop, axisRight } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, create, select, Selection } from 'd3-selection';
import { Component, IComponent, IComponentConfig, utils } from '../core';

export enum Position {
  Left,
  Bottom,
  Top,
  Right,
}

export interface ITicksConfig extends IComponentConfig {
  scale: AxisScale<unknown>;
}

export interface ITicks extends IComponent<ITicksConfig> {}

export class Ticks extends Component<ITicksConfig> implements ITicks {
  private _labelPosition: Position;

  private static _renderFunctionByPosition = new Map<
    Position,
    (
      selection: Selection<SVGElement, unknown, BaseType, unknown>,
      scale: AxisScale<unknown>
    ) => void
  >([
    [Position.Top, renderTopTicks],
    [Position.Right, renderRightTicks],
    [Position.Bottom, renderBottomTicks],
    [Position.Left, renderLeftTicks],
  ]);

  constructor(labelPosition: Position) {
    const vertical = labelPosition === Position.Left || labelPosition === Position.Right;
    super(
      create<SVGElement>('svg:g').classed('ticks', true),
      {
        scale: scaleLinear().domain([0, 1]).range([0, 100]),
        attributes: {
          ...(vertical ? { width: 'min-content' } : { height: 'min-content' }),
        },
        conditionalConfigs: [],
      },
      Component.mergeConfigs
    );
    this._labelPosition = labelPosition;
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: ITicksConfig): void {}

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this.render(false);
    return this;
  }

  resize(): this {
    this.render(false);
    return this;
  }

  protected _afterResize(): void {
    this.render(false);
  }

  render(animated: boolean): this {
    this.selection()
      .call(Ticks._renderFunctionByPosition.get(this._labelPosition)!, this.activeConfig().scale)
      .call(utils.applyAttributes, this.activeConfig().attributes);
    return this;
  }

  renderOrder(): number {
    // It is important that ticks render after the component which set up their scale
    return 10;
  }
}

export function ticks(position: Position): Ticks {
  return new Ticks(position);
}

export function leftTicks(): Ticks {
  return new Ticks(Position.Left);
}

export function rightTicks(): Ticks {
  return new Ticks(Position.Right);
}

export function topTicks(): Ticks {
  return new Ticks(Position.Top);
}

export function bottomTicks(): Ticks {
  return new Ticks(Position.Bottom);
}

const axisFunctionByPosition = new Map<Position, (scale: AxisScale<unknown>) => Axis<unknown>>();
axisFunctionByPosition.set(Position.Left, axisLeft);
axisFunctionByPosition.set(Position.Bottom, axisBottom);
axisFunctionByPosition.set(Position.Top, axisTop);
axisFunctionByPosition.set(Position.Right, axisRight);

function renderTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  position: Position,
  scale: AxisScale<unknown>
): void {
  selection
    .call(axisFunctionByPosition.get(position)!(scale))
    .attr('font-size', '0.7em')
    .call((ticksSelection) =>
      ticksSelection.selectAll<SVGTextElement, never>('.tick text').each((d, i, groups) => {
        const x = groups[i].getAttribute('x') || '0';
        const y = groups[i].getAttribute('y') || '0';
        select(groups[i])
          .attr('x', null)
          .attr('y', null)
          .attr('dx', null)
          .attr('dy', null)
          .attr('transform', `translate(${x}, ${y})`);
      })
    );
}

function renderLeftTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Left, scale)
    .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'middle'))
    .call(function (ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>) {
      var boundingRect = ticksSelection.node()!.getBoundingClientRect();
      ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
    });
}

function renderBottomTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Bottom, scale)
    .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'hanging'));
}

function renderTopTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Top, scale)
    .call(function (ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>) {
      var boundingRect = ticksSelection.node()!.getBoundingClientRect();
      ticksSelection.attr('transform', `translate(0, ${boundingRect.height})`);
    });
}

function renderRightTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Right, scale)
    .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'middle'));
}
