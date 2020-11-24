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
import { IStringable } from '../core/utils';

export enum Position {
  Left,
  Bottom,
  Top,
  Right,
}

export interface ITicksComponentConfig extends IComponentConfig {
  scale: AxisScale<unknown>;
  labelFormatter: (value: IStringable) => string;
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
    (selection: Selection<SVGElement, unknown, BaseType, unknown>, axis: Axis<unknown>) => void
  >([
    [Position.Top, renderTopTicks],
    [Position.Right, renderRightTicks],
    [Position.Bottom, renderBottomTicks],
    [Position.Left, renderLeftTicks],
  ]);

  private static _axisFunctionByPosition = new Map<
    Position,
    (scale: AxisScale<unknown>) => Axis<unknown>
  >([
    [Position.Left, axisLeft],
    [Position.Bottom, axisBottom],
    [Position.Top, axisTop],
    [Position.Right, axisRight],
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
        labelFormatter: (value: IStringable) => value.toString(),
        attributes: {
          ...(vertical ? { width: 'min-content' } : { height: 'min-content' }),
        },
        responsiveConfigs: {},
        events: {},
        parseConfig: (
          previousConfig: ITicksComponentConfig,
          newConfig: ITicksComponentConfig
        ) => {},
        applyConfig: (previousConfig: ITicksComponentConfig, newConfig: ITicksComponentConfig) => {
          TicksComponent.clearEventListeners(this, previousConfig);
          TicksComponent.setEventListeners(this, newConfig);
          this._render(newConfig, true);
        },
      },
      Component.mergeConfigs
    );
    this._labelPosition = labelPosition;
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
      .call(
        TicksComponent._renderFunctionByPosition.get(this._labelPosition)!,
        TicksComponent._axisFunctionByPosition.get(this._labelPosition)!(config.scale).tickFormat(
          config.labelFormatter
        )
      )
      .call(utils.applyAttributes, config.attributes);
    return this;
  }

  render(animated: boolean): this {
    return this._render(this.activeConfig(), animated);
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

function renderTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  axis: Axis<unknown>
): void {
  selection
    .call(axis)
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
  axis: Axis<unknown>
): void {
  selection
    .call(renderTicks, axis)
    .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'middle'))
    .call(function (ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>) {
      var boundingRect = ticksSelection.node()!.getBoundingClientRect();
      ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
    });
}

function renderBottomTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  axis: Axis<unknown>
): void {
  selection
    .call(renderTicks, axis)
    .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'hanging'));
}

function renderTopTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  axis: Axis<unknown>
): void {
  selection
    .call(renderTicks, axis)
    .call(function (ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>) {
      var boundingRect = ticksSelection.node()!.getBoundingClientRect();
      ticksSelection.attr('transform', `translate(0, ${boundingRect.height})`);
    });
}

function renderRightTicks(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  axis: Axis<unknown>
): void {
  selection
    .call(renderTicks, axis)
    .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'middle'));
}
