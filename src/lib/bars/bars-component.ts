import {
  Component,
  ComponentEventData,
  categoricalColors,
  BaseComponent,
  rectFromString,
} from '../core';
import { Selection, BaseType, EnterElement } from 'd3-selection';
import { BarOrientation, Bars, BarsCalculator } from './bars';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { SelectionOrTransition } from 'd3-transition';
import { Rect } from '../core/rect';

export interface BarData {
  categoryIndex: number;
  rect: Rect<number>;
}

export type CreateBarsFunction = (
  enterSelection: Selection<EnterElement, BarData, any, any>
) => Selection<SVGRectElement, any, any, any>;

export type UpdateBarsFunction = (
  selection: SelectionOrTransition<BaseType, BarData, any, any>
) => void;

export interface BarsEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  index: number;
  element: SVGRectElement;
}

export class BarsComponent extends BaseComponent implements Bars {
  private _barsCalculator: BarsCalculator;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateBars: CreateBarsFunction;
  private _onUpdateBars: UpdateBarsFunction;

  static defaultColor = categoricalColors[0];

  constructor() {
    super('g');

    this._barsCalculator = new BarsCalculator();
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreateBars = createBars;
    this._onUpdateBars = updateBars;
    this.classed('bars', true)
      .attr('fill', BarsComponent.defaultColor)
      .attr('layout', '0, 0, 600, 400');
  }

  categories(): any[];
  categories(categories: any[]): this;
  categories(categories?: any[]): any[] | this {
    if (categories === undefined) return this._barsCalculator.categories();
    this._barsCalculator.categories(categories);
    return this;
  }

  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  categoryScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
    if (scale === undefined) return this._barsCalculator.categoryScale();
    this._barsCalculator.categoryScale(scale);
    return this;
  }

  values(): any[];
  values(values: any[]): this;
  values(values?: any[]): any[] | this {
    if (values === undefined) return this._barsCalculator.values();
    this._barsCalculator.values(values);
    return this;
  }

  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  valueScale(
    scale?: ScaleContinuousNumeric<number, number>
  ): ScaleContinuousNumeric<number, number> | this {
    if (scale === undefined) return this._barsCalculator.valueScale();
    this._barsCalculator.valueScale(scale);
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: BarOrientation): BarOrientation | this {
    if (orientation === undefined) return this._barsCalculator.orientation();
    this._barsCalculator.orientation(orientation);
    return this;
  }

  bars(): Rect<number>[] {
    return this._barsCalculator.bars();
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

  onUpdateBars(): UpdateBarsFunction;
  onUpdateBars(callback: UpdateBarsFunction): this;
  onUpdateBars(callback?: any) {
    if (callback === undefined) return this._onUpdateBars;
    this._onUpdateBars = callback;
    return this;
  }

  afterLayout(): this {
    super.afterLayout();
    this._barsCalculator.fitInSize(rectFromString(this.attr('layout')));
    return this;
  }

  render(): this {
    super.render();
    this.selection()
      .selectAll('.bar')
      .data(this._barsCalculator.bars().map((rect, i) => ({ categoryIndex: i, rect: rect })))
      .join(this._onCreateBars)
      .call(this._onUpdateBars);
    return this;
  }

  transition(): this {
    super.transition();
    this.selection()
      .selectAll('.bar')
      .data(this._barsCalculator.bars().map((rect, i) => ({ categoryIndex: i, rect: rect })))
      .join(this._onCreateBars)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(this._onUpdateBars);
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

export function bars(): BarsComponent {
  return new BarsComponent();
}

export function createBars(
  enterSelection: Selection<EnterElement, BarData, any, any>
): Selection<SVGRectElement, any, any, any> {
  return enterSelection
    .append('rect')
    .classed('bar', true)
    .attr('x', (d) => d.rect.x + d.rect.width / 2)
    .attr('y', (d) => d.rect.y + d.rect.height / 2)
    .attr('width', 0)
    .attr('height', 0);
}

export function updateBars(selection: SelectionOrTransition<BaseType, BarData, any, any>): void {
  selection
    .attr('x', (d) => d.rect.x)
    .attr('y', (d) => d.rect.y)
    .attr('width', (d) => d.rect.width)
    .attr('height', (d) => d.rect.height);
}
