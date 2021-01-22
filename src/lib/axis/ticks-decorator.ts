import { AxisScale, Axis, AxisDomain } from 'd3-axis';
import { BaseType, create, select, Selection } from 'd3-selection';
import { ScaleAny, linearScale, ComponentDecorator } from '../core';
import { ContainerComponent } from '../core/components/container-component';
import { ISize } from '../core/utils';

export type CreateTicksFunction = (
  selection: Selection<SVGElement, any, BaseType, any>
) => Selection<BaseType, any, BaseType, any>;

export type ConfigureAxisFunction = (axis: Axis<AxisDomain>) => void;
export type FormatLabelsFunction = (label: string) => string;

export abstract class TicksDecorator extends ComponentDecorator<ContainerComponent> {
  private _scale: ScaleAny<any, any, any>;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onConfigureAxis: ConfigureAxisFunction;

  constructor(component: ContainerComponent) {
    super(component);
    this._onConfigureAxis = () => {};
    this.component().classed('ticks', true);

    this._scale = linearScale().domain([0, 1]).range([0, 100]);
    this._transitionDelay = 0;
    this._transitionDuration = 250;
  }

  scale(): ScaleAny<any, any, any>;
  scale(scale: ScaleAny<any, any, any>): this;
  scale(scale?: ScaleAny<any, any, any>): ScaleAny<any, any, any> | this {
    if (scale === undefined) return this._scale;
    this._scale = scale;
    return this;
  }

  transitionDuration(): number;
  transitionDuration(duration: number): this;
  transitionDuration(duration?: number): number | this {
    if (duration === undefined) return this._transitionDuration;
    this._transitionDuration = duration;
    return this;
  }

  transitionDelay(): number;
  transitionDelay(delay: number): this;
  transitionDelay(delay?: number): number | this {
    if (delay === undefined) return this._transitionDelay;
    this._transitionDelay = delay;
    return this;
  }

  onConfigureAxis(): ConfigureAxisFunction;
  onConfigureAxis(callback: ConfigureAxisFunction): this;
  onConfigureAxis(callback?: ConfigureAxisFunction): ConfigureAxisFunction | this {
    if (callback === undefined) return this._onConfigureAxis;
    this._onConfigureAxis = callback;
    return this;
  }

  beforeLayout(): this {
    super.beforeLayout();
    const axis = this.createAxis(this._scale);
    this._onConfigureAxis(axis);
    this.component().staticCloneSelection().call(axis);
    return this;
  }

  render(): this {
    super.render();
    const axis = this.createAxis(this._scale);
    this._onConfigureAxis(axis);
    this.component().selection().call(axis);
    return this;
  }

  transition(): this {
    super.transition();
    const axis = this.createAxis(this._scale);
    this._onConfigureAxis(axis);

    this.component()
      .selection()
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      // @ts-ignore the types for d3 axes are wrong and the following call is actually valid
      .call(axis);

    return this;
  }

  protected abstract createAxis(scale: AxisScale<AxisDomain>): Axis<AxisDomain>;
}
