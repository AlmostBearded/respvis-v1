import { AxisScale, Axis, axisLeft, axisBottom, axisTop, axisRight } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, create, select, Selection } from 'd3-selection';
import {
  Component,
  IComponent,
  IComponentConfig,
  IComponentEventData,
  ITextComponentConfig,
  utils,
} from '../core';
import { applyLayoutTransforms } from '../core/layout/layout';

export enum Position {
  Left,
  Bottom,
  Top,
  Right,
}

export interface ITicksComponentConfig extends IComponentConfig {
  scale: AxisScale<unknown>;
  events: utils.IDictionary<(event: Event, data: ITicksEventData) => void>;
}

export interface ITicksEventData extends IComponentEventData {
  tickIndex: number;
}

export interface ITicksComponent extends IComponent<ITicksComponentConfig> {}

export class TicksComponent extends Component<ITicksComponentConfig> implements ITicksComponent {
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

  static setEventListeners(component: TicksComponent, config: ITicksComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        if (e.target instanceof SVGPathElement) {
          // Domain element
        } else if (e.target instanceof SVGLineElement || e.target instanceof SVGTextElement) {
          const tickElement = e.target.parentNode!;
          const indexOf = Array.prototype.indexOf;
          const tickIndex = indexOf.call(tickElement.parentNode!.children, tickElement);
          config.events[typenames](e, {
            component: component,
            tickIndex: tickIndex - 1, // -1 because the domain element is always the first child
          });
        }
      });
    }
  }

  constructor(labelPosition: Position) {
    const vertical = labelPosition === Position.Left || labelPosition === Position.Right;
    super(
      create<SVGElement>('svg:g').classed('ticks', true),
      {
        scale: scaleLinear().domain([0, 1]).range([0, 100]),
        attributes: {
          ...(vertical ? { width: 'min-content' } : { height: 'min-content' }),
        },
        responsiveConfigs: {},
        events: {},
        configParser: (previousConfig: ITicksComponentConfig, newConfig: ITicksComponentConfig) => {
          TicksComponent.clearEventListeners(this, previousConfig);
          TicksComponent.setEventListeners(this, newConfig);
          this._render(newConfig, true);
        },
      },
      Component.mergeConfigs
    );
    this._labelPosition = labelPosition;
    this._applyResponsiveConfigs();
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this.render(false);
    return this;
  }

  resize(): this {
    return this;
  }

  private _render(config: ITicksComponentConfig, animated: boolean): this {
    this.selection()
      .call(TicksComponent._renderFunctionByPosition.get(this._labelPosition)!, config.scale)
      .call(utils.applyAttributes, config.attributes);
    return this;
  }

  render(animated: boolean): this {
    return this._render(this.activeConfig(), animated);
  }

  renderOrder(): number {
    // It is important that ticks render after the component which set up their scale
    return 10;
  }
}

export function ticks(position: Position): TicksComponent {
  return new TicksComponent(position);
}

export function leftTicks(): TicksComponent {
  return new TicksComponent(Position.Left);
}

export function rightTicks(): TicksComponent {
  return new TicksComponent(Position.Right);
}

export function topTicks(): TicksComponent {
  return new TicksComponent(Position.Top);
}

export function bottomTicks(): TicksComponent {
  return new TicksComponent(Position.Bottom);
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
