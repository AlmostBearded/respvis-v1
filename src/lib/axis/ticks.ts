import { Scale } from 'chroma-js';
import { AxisScale, Axis, axisLeft, axisBottom, axisTop, axisRight, AxisDomain } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, create, select, Selection } from 'd3-selection';
import { Transition } from 'd3-transition';
import { Component, utils, ScaleAny } from '../core';
import { Constructor } from '../core/mixins/constructor';
import { TransitionDelayMixin } from '../core/mixins/transition-delay';
import { TransitionDurationMixin } from '../core/mixins/transition-duration';
import { IStringable } from '../core/utils';

export enum Position {
  Left,
  Bottom,
  Top,
  Right,
}

export type CreateTicksFunction = (
  selection: Selection<SVGElement, any, BaseType, any>
) => Selection<BaseType, any, BaseType, any>;

export type ConfigureAxisFunction = (axis: Axis<AxisDomain>) => void;

export abstract class TicksComponent extends TransitionDelayMixin(
  0,
  TransitionDurationMixin(250, Component)
) {
  private _onConfigureAxis: ConfigureAxisFunction;
  private _scale: ScaleAny<any, any, any>;
  protected _transition: Transition<SVGElement, any, any, any>;

  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:g'));
  }

  init(): this {
    super.init();
    this._onConfigureAxis = () => {};
    return this.classed('ticks', true);
  }

  onConfigureAxis(): ConfigureAxisFunction;
  onConfigureAxis(callback: ConfigureAxisFunction): this;
  onConfigureAxis(callback?: ConfigureAxisFunction): ConfigureAxisFunction | this {
    if (callback === undefined) return this._onConfigureAxis;
    this._onConfigureAxis = callback;
    return this;
  }

  scale(): ScaleAny<any, any, any>;
  scale(scale: ScaleAny<any, any, any>): this;
  scale(scale?: ScaleAny<any, any, any>): ScaleAny<any, any, any> | this {
    if (scale === undefined) return this._scale;
    this._scale = scale;
    return this;
  }

  render(): this {
    super.render();
    const axis = this.createAxis(this._scale);
    this._onConfigureAxis(axis);
    // this.renderAxis(axis);
    this.selection().call(axis).attr('font-size', '0.7em');
    // this.transformTextAttributes();
    return this;
  }

  transition(): this {
    super.transition();
    const axis = this.createAxis(this._scale);
    this._onConfigureAxis(axis);
    this.selection().selectAll('.tick text').attr('transform', null);
    this._transition = this.selection()
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      // @ts-ignore the types for d3 axes are wrong and the following call is actually valid
      .call(axis)
      .attr('font-size', '0.7em')
      .on('start', () => this.chart().requestLayout(this._transitionDuration));

    return this;
  }

  protected abstract createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain>;
}

// export interface ITicksComponentConfig extends IComponentConfig {
//   scale: AxisScale<unknown>;
//   ticks?: any;
//   tickValues?: any[];
//   labelFormatter: (value: IStringable) => string;
//   events: utils.IDictionary<(event: Event, data: ITicksEventData) => void>;
// }

// export interface ITicksEventData extends IComponentEventData {
//   tickIndex: number;
// }

// export interface ITicksComponent extends IComponent<ITicksComponentConfig> {}

// export class TicksComponent extends Component<ITicksComponentConfig> implements ITicksComponent {
//   private _labelPosition: Position;

//   private static _renderFunctionByPosition = new Map<
//     Position,
//     (selection: Selection<SVGElement, unknown, BaseType, unknown>, axis: Axis<unknown>) => void
//   >([
//     [Position.Top, renderTopTicks],
//     [Position.Right, renderRightTicks],
//     [Position.Bottom, renderBottomTicks],
//     [Position.Left, renderLeftTicks],
//   ]);

//   private static _axisFunctionByPosition = new Map<
//     Position,
//     (scale: AxisScale<unknown>) => Axis<unknown>
//   >([
//     [Position.Left, axisLeft],
//     [Position.Bottom, axisBottom],
//     [Position.Top, axisTop],
//     [Position.Right, axisRight],
//   ]);

//   static setEventListeners(component: TicksComponent, config: ITicksComponentConfig) {
//     for (const typenames in config.events) {
//       component.selection().on(typenames, (e: Event) => {
//         if (e.target instanceof SVGPathElement) {
//           // Domain element
//         } else if (e.target instanceof SVGLineElement || e.target instanceof SVGTextElement) {
//           const tickElement = e.target.parentNode!;
//           const indexOf = Array.prototype.indexOf;
//           const tickIndex = indexOf.call(tickElement.parentNode!.children, tickElement);
//           config.events[typenames](e, {
//             component: component,
//             tickIndex: tickIndex - 1, // -1 because the domain element is always the first child
//           });
//         }
//       });
//     }
//   }

//   constructor(labelPosition: Position) {
//     const vertical = labelPosition === Position.Left || labelPosition === Position.Right;
//     super(
//       create<SVGElement>('svg:g').classed('ticks', true),
//       {
//         scale: scaleLinear().domain([0, 1]).range([0, 100]),
//         labelFormatter: (value: IStringable) => value.toString(),
//         attributes: {
//           ...(vertical ? { width: 'min-content' } : { height: 'min-content' }),
//         },
//         responsiveConfigs: {},
//         events: {},
//         parseConfig: (
//           previousConfig: ITicksComponentConfig,
//           newConfig: ITicksComponentConfig
//         ) => {},
//         applyConfig: (previousConfig: ITicksComponentConfig, newConfig: ITicksComponentConfig) => {
//           TicksComponent.clearEventListeners(this, previousConfig);
//           TicksComponent.setEventListeners(this, newConfig);
//           this._render(newConfig, true);
//         },
//       },
//       Component.mergeConfigs
//     );
//     this._labelPosition = labelPosition;
//   }

//   mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
//     selection.append(() => this.selection().node());
//     this.render(false);
//     return this;
//   }

//   private _render(config: ITicksComponentConfig, animated: boolean): this {
//     const axis = TicksComponent._axisFunctionByPosition.get(this._labelPosition)!(config.scale);
//     axis.tickFormat(config.labelFormatter);
//     if (config.ticks) axis.ticks(config.ticks);
//     if (config.tickValues) axis.tickValues(config.tickValues);

//     this.selection()
//       .call(TicksComponent._renderFunctionByPosition.get(this._labelPosition)!, axis)
//       .call(setUniformNestedAttributes, config.attributes);
//     return this;
//   }

//   render(animated: boolean): this {
//     return this._render(this.activeConfig(), animated);
//   }
// }

// export function ticks(position: Position): TicksComponent {
//   return new TicksComponent(position);
// }

// export function leftTicks(): TicksComponent {
//   return new TicksComponent(Position.Left);
// }

// export function rightTicks(): TicksComponent {
//   return new TicksComponent(Position.Right);
// }

// export function topTicks(): TicksComponent {
//   return new TicksComponent(Position.Top);
// }

// export function bottomTicks(): TicksComponent {
//   return new TicksComponent(Position.Bottom);
// }

// function renderLeftTicks(
//   selection: Selection<SVGElement, unknown, BaseType, unknown>,
//   axis: Axis<unknown>
// ): void {
//   selection
//     .call(renderTicks, axis)
//     .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'middle'))
//     .call(function (ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>) {
//       var boundingRect = ticksSelection.node()!.getBoundingClientRect();
//       ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
//     });
// }

// function renderBottomTicks(
//   selection: Selection<SVGElement, unknown, BaseType, unknown>,
//   axis: Axis<unknown>
// ): void {
//   selection
//     .call(renderTicks, axis)
//     .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'hanging'));
// }

// function renderTopTicks(
//   selection: Selection<SVGElement, unknown, BaseType, unknown>,
//   axis: Axis<unknown>
// ): void {
//   selection
//     .call(renderTicks, axis)
//     .call(function (ticksSelection: Selection<SVGGElement, unknown, SVGElement, unknown>) {
//       var boundingRect = ticksSelection.node()!.getBoundingClientRect();
//       ticksSelection.attr('transform', `translate(0, ${boundingRect.height})`);
//     });
// }

// function renderRightTicks(
//   selection: Selection<SVGElement, unknown, BaseType, unknown>,
//   axis: Axis<unknown>
// ): void {
//   selection
//     .call(renderTicks, axis)
//     .call((s) => s.selectAll('.tick text').attr('dominant-baseline', 'middle'));
// }
