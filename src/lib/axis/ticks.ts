import { Component, IComponent, IComponentConfig } from '../component';
import { Selection, BaseType, select, create } from 'd3-selection';
import { ILayout } from '../layout/layout';
import {
  Axis,
  axisBottom,
  axisLeft,
  axisRight,
  AxisScale,
  axisTop,
} from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { applyAttributes, Attributes } from '../utils';

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
    const vertical =
      labelPosition === Position.Left || labelPosition === Position.Right;
    super(create<SVGElement>('svg:g').classed('ticks', true), {
      scale: scaleLinear().domain([0, 1]).range([0, 100]),
      attributes: {
        ...(vertical ? { width: 'min-content' } : { height: 'min-content' }),
      },
      responsiveConfigs: [],
    });
    this._labelPosition = labelPosition;
  }

  protected _applyConfig(config: ITicksConfig): void {
    this.render(0);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this.render(0);
    return this;
  }

  fitInLayout(layout: ILayout): this {
    return this;
  }

  render(transitionDuration: number): this {
    this.selection()
      .call(
        Ticks._renderFunctionByPosition.get(this._labelPosition)!,
        this._activeConfig.scale
      )
      .call(applyAttributes, this._activeConfig.attributes);
    //   .call((s) =>
    //     s.select('.domain').call(applyAttributes, this._domainAttributes)
    //   )
    //   .call((s) =>
    //     s
    //       .selectAll('.tick line')
    //       .call(applyAttributes, this._tickLineAttributes)
    //   )
    //   .call((s) =>
    //     s
    //       .selectAll('.tick text')
    //       .call(applyAttributes, this._tickLabelAttributes)
    //   );
    return this;
  }

  renderOrder(): number {
    // It is important that ticks render after the component which sets up its scale
    return 10;
  }
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

const axisFunctionByPosition = new Map<
  Position,
  (scale: AxisScale<unknown>) => Axis<unknown>
>();
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
      ticksSelection
        .selectAll<SVGTextElement, never>('.tick text')
        .each((d, i, groups) => {
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
  selection
    .call(renderTicks, Position.Bottom, scale)
    .call((s) =>
      s.selectAll('.tick text').attr('dominant-baseline', 'hanging')
    );
}

function renderTopTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  scale: AxisScale<unknown>
): void {
  selection
    .call(renderTicks, Position.Top, scale)
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
  selection
    .call(renderTicks, Position.Right, scale)
    .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'middle'));
}
