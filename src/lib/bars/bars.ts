import {
  IRect,
  Rect,
  colors,
  transitionBoundAttributes,
  setBoundAttributes,
  Component,
  Chart,
} from '../core';
import { Selection, BaseType, create, EnterElement } from 'd3-selection';
import { BarOrientation, BarPositioner, Bars } from './bar-positioner';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { TransitionDurationMixin } from '../core/mixins/transition-duration';
import { TransitionDelayMixin } from '../core/mixins/transition-delay';

export type CreateBarsFunction = (
  enterSelection: Selection<EnterElement, IRect<number>, BaseType, any>
) => Selection<BaseType, any, BaseType, any>;

export class BarsComponent
  extends TransitionDelayMixin(250, TransitionDurationMixin(250, Component))
  implements Bars {
  private _barPositioner: BarPositioner;
  private _onCreateBars: CreateBarsFunction;

  static defaultColor = colors.categorical[0];

  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:g'));
  }

  init(): this {
    super.init();
    this._barPositioner = new BarPositioner();
    this._transitionDuration = 250;
    this._transitionDelay = 250;

    this._onCreateBars = (enter) =>
      enter
        .append('rect')
        .classed('bar', true)
        .attr('x', (d) => d.x + d.width / 2)
        .attr('y', (d) => d.y + d.height / 2)
        .attr('width', 0)
        .attr('height', 0);

    this.classed('bars', true)
      .attr('fill', BarsComponent.defaultColor)
      .attr('layout', '0, 0, 600, 400');

    return this;
  }

  render(): this {
    this.selectAll('.bar')
      .data(this._barPositioner.fitInSize(Rect.fromString(this.attr('layout'))).bars())
      .join(this._onCreateBars)
      .call(setBoundAttributes);
    return super.render();
  }

  transition(): this {
    this.selectAll('.bar')
      .data(this._barPositioner.fitInSize(Rect.fromString(this.attr('layout'))).bars())
      .join(this._onCreateBars)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(transitionBoundAttributes);
    return super.transition();
  }

  layout(): this {
    this.selectAll('.bar')
      .data(this._barPositioner.fitInSize(Rect.fromString(this.attr('layout'))).bars())
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(transitionBoundAttributes);
    super.layout();
    return this;
  }

  categories(): any[];
  categories(categories: any[]): this;
  categories(categories?: any[]): any[] | this {
    if (categories === undefined) return this._barPositioner.categories();
    this._barPositioner.categories(categories);
    return this;
  }

  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  categoryScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
    if (scale === undefined) return this._barPositioner.categoryScale();
    this._barPositioner.categoryScale(scale);
    return this;
  }

  values(): any[];
  values(values: any[]): this;
  values(values?: any[]): any[] | this {
    if (values === undefined) return this._barPositioner.values();
    this._barPositioner.values(values);
    return this;
  }

  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  valueScale(
    scale?: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> | this {
    if (scale === undefined) return this._barPositioner.valueScale();
    this._barPositioner.valueScale(scale);
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: BarOrientation): BarOrientation | this {
    if (orientation === undefined) return this._barPositioner.orientation();
    this._barPositioner.orientation(orientation);
    return this;
  }

  onCreateBars(): CreateBarsFunction;
  onCreateBars(callback: CreateBarsFunction): this;
  onCreateBars(callback?: CreateBarsFunction): CreateBarsFunction | this {
    if (callback === undefined) return this._onCreateBars;
    this._onCreateBars = callback;
    return this;
  }

  bars(): IRect<number>[] {
    return this._barPositioner.bars();
  }

  // static setEventListeners(component: BarsComponent, config: IBarsComponentConfig) {
  //   for (const typenames in config.events) {
  //     component.selection().on(typenames, (e: Event) => {
  //       const barElement = e.target as SVGRectElement;
  //       const index = Array.prototype.indexOf.call(barElement.parentNode!.children, barElement);
  //       config.events[typenames](e, {
  //         component: component,
  //         index: index,
  //         barElement: barElement,
  //       });
  //     });
  //   }
  // }
}
