import {
  IRect,
  Rect,
  colors,
  transitionBoundAttributes,
  setBoundAttributes,
  Component,
  ComponentEventData,
} from '../core';
import { Selection, BaseType, EnterElement } from 'd3-selection';
import { BarOrientation, Bars, BarsCalculator } from './bars';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { ContainerComponent } from '../core/components/container-component';
import { ComponentDecorator } from '../core/component-decorator';

export type CreateBarsFunction = (
  enterSelection: Selection<EnterElement, IRect<number>, any, any>
) => Selection<BaseType, any, any, any>;

export interface BarsEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  index: number;
  element: SVGRectElement;
}

export class BarsDecorator extends ComponentDecorator<ContainerComponent> implements Bars {
  private _bars: BarsCalculator;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateBars: CreateBarsFunction;

  static defaultColor = colors.categorical[0];

  constructor(component: ContainerComponent) {
    super(component);

    this._bars = new BarsCalculator();
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

    this.component()
      .classed('bars', true)
      .attr('fill', BarsDecorator.defaultColor)
      .attr('layout', '0, 0, 600, 400');
  }

  categories(): any[];
  categories(categories: any[]): this;
  categories(categories?: any[]): any[] | this {
    if (categories === undefined) return this._bars.categories();
    this._bars.categories(categories);
    return this;
  }

  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  categoryScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
    if (scale === undefined) return this._bars.categoryScale();
    this._bars.categoryScale(scale);
    return this;
  }

  values(): any[];
  values(values: any[]): this;
  values(values?: any[]): any[] | this {
    if (values === undefined) return this._bars.values();
    this._bars.values(values);
    return this;
  }

  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  valueScale(
    scale?: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> | this {
    if (scale === undefined) return this._bars.valueScale();
    this._bars.valueScale(scale);
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: BarOrientation): BarOrientation | this {
    if (orientation === undefined) return this._bars.orientation();
    this._bars.orientation(orientation);
    return this;
  }

  bars(): IRect<number>[] {
    return this._bars.bars();
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

  onCreateBars(): CreateBarsFunction;
  onCreateBars(callback: CreateBarsFunction): this;
  onCreateBars(callback?: CreateBarsFunction): CreateBarsFunction | this {
    if (callback === undefined) return this._onCreateBars;
    this._onCreateBars = callback;
    return this;
  }

  afterLayout(): this {
    super.afterLayout();
    this._bars.fitInSize(Rect.fromString(this.component().attr('layout')));
    return this;
  }

  render(): this {
    super.render();
    this.component()
      .selection()
      .selectAll('.bar')
      .data(this._bars.bars())
      .join(this._onCreateBars)
      .call(setBoundAttributes);
    return this;
  }

  transition(): this {
    super.transition();
    this.component()
      .selection()
      .selectAll('.bar')
      .data(this._bars.bars())
      .join(this._onCreateBars)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(transitionBoundAttributes);
    return this;
  }

  eventData(event: Event): BarsEventData<this> {
    const element = event.target as SVGRectElement;
    const index = Array.prototype.indexOf.call(element.parentNode!.children, element);
    return {
      component: this,
      index: index,
      element: element,
    };
  }
}
