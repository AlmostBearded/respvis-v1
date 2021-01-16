import { Scale } from 'chroma-js';
import { AxisScale, Axis, axisLeft, axisBottom, axisTop, axisRight, AxisDomain } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { BaseType, create, select, Selection } from 'd3-selection';
import { Transition } from 'd3-transition';
import { Component, utils, ScaleAny } from '../core';
import { Constructor } from '../core/mixins/constructor';
import { TransitionDelayMixin } from '../core/mixins/transition-delay';
import { TransitionDurationMixin } from '../core/mixins/transition-duration';
import { ISize, IStringable } from '../core/utils';

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
  protected _hiddenTicksSelection: Selection<SVGElement, any, any, any>;
  protected _bounds: ISize;

  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:g'));
  }

  init(): this {
    super.init();
    this._onConfigureAxis = () => {};
    this.classed('ticks', true);

    this._hiddenTicksSelection = create<SVGElement>('svg:g')
      .classed('hidden-ticks', true)
      .attr('opacity', 0.25);
    return this;
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
    this.selection().call(axis);
    // this.transformTextAttributes();
    return this;
  }

  transition(): this {
    super.transition();
    const axis = this.createAxis(this._scale);
    this._onConfigureAxis(axis);

    this._transition = this.selection()
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      // @ts-ignore the types for d3 axes are wrong and the following call is actually valid
      .call(axis);

    return this;
  }

  update(): this {
    super.update();

    const axis = this.createAxis(this._scale);
    this._onConfigureAxis(axis);

    this._hiddenTicksSelection.call(axis);
    select(this.node().parentElement).append(() => this._hiddenTicksSelection.node());
    this._bounds = this._hiddenTicksSelection.node()!.getBoundingClientRect();
    this._hiddenTicksSelection.remove();

    return this;
  }

  protected abstract createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain>;
}
