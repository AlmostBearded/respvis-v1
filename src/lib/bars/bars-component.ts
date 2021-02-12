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
  key: string;
  rect: Rect<number>;
}

export type CreateBarsFunction = (
  enterSelection: Selection<EnterElement, BarData, any, any>
) => Selection<SVGRectElement, BarData, any, any>;

export type RemoveBarsFunction = (
  exitSelection: Selection<SVGRectElement, BarData, any, any>
) => void;

export type UpdateBarsFunction = (
  selection: SelectionOrTransition<SVGRectElement, BarData, any, any>
) => void;

export interface BarsEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  index: number;
  element: SVGRectElement;
}

export class BarsComponent extends BaseComponent implements Bars {
  private _barsCalculator: BarsCalculator;
  private _keys: string[] | undefined;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateBars: CreateBarsFunction;
  private _onRemoveBars: RemoveBarsFunction;
  private _onUpdateBars: UpdateBarsFunction;

  static defaultColor = categoricalColors[0];

  constructor() {
    super('g');

    this._barsCalculator = new BarsCalculator();
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreateBars = createBars;
    this._onRemoveBars = (selection) => removeBars(selection, this._transitionDuration);
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

  keys(): string[];
  keys(keys: null): this;
  keys(keys: string[]): this;
  keys(keys?: string[] | null) {
    if (keys === undefined) return this._keys;
    if (keys === null) this._keys = undefined;
    else this._keys = keys;
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

  onCreateBars(): CreateBarsFunction;
  onCreateBars(callback: CreateBarsFunction): this;
  onCreateBars(callback?: CreateBarsFunction): CreateBarsFunction | this {
    if (callback === undefined) return this._onCreateBars;
    this._onCreateBars = callback;
    return this;
  }

  onRemoveBars(): RemoveBarsFunction;
  onRemoveBars(callback: RemoveBarsFunction): this;
  onRemoveBars(callback?: RemoveBarsFunction): RemoveBarsFunction | this {
    if (callback === undefined) return this._onRemoveBars;
    this._onRemoveBars = callback;
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

  barData(): BarData[] {
    return this._barsCalculator
      .bars()
      .map((rect, i) => ({ categoryIndex: i, key: this._keys?.[i] || i.toString(), rect: rect }));
  }

  render(): this {
    super.render();
    this.selection()
      .selectAll<SVGRectElement, BarData>('.bar')
      .data(this.barData(), (d) => d.key)
      .join(this._onCreateBars, undefined, this._onRemoveBars)
      .call(this._onUpdateBars);
    return this;
  }

  transition(): this {
    super.transition();
    this.selection()
      .selectAll<SVGRectElement, BarData>('.bar')
      .data(this.barData(), (d) => d.key)
      .join(this._onCreateBars, undefined, this._onRemoveBars)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(this._onUpdateBars);
    return this;
  }

  eventData(event: Event): BarsEventData<this> {
    const element = event.target as SVGRectElement;
    const rootElement = element.parentNode! as Element;

    let index = Array.prototype.indexOf.call(rootElement.children, element);
    for (let i = 0; i <= index; ++i)
      if (rootElement.children[i].classList.contains('exiting')) --index;

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

export function removeBars(
  exitSelection: Selection<any, BarData, any, any>,
  transitionDuration: number
): void {
  exitSelection
    .classed('exiting', true)
    .transition()
    .duration(transitionDuration)
    .attr('x', (d) => d.rect.x + d.rect.width / 2)
    .attr('y', (d) => d.rect.y + d.rect.height / 2)
    .attr('width', 0)
    .attr('height', 0)
    .remove();
}

export function updateBars(selection: SelectionOrTransition<BaseType, BarData, any, any>): void {
  selection
    .attr('x', (d) => d.rect.x)
    .attr('y', (d) => d.rect.y)
    .attr('width', (d) => d.rect.width)
    .attr('height', (d) => d.rect.height);
}
