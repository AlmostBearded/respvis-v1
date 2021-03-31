import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { BaseType, EnterElement, select, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import {
  BaseComponent,
  categoricalColors,
  Component,
  ComponentEventData,
  LayoutTransformMixin,
  rectFromString,
} from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';
import { BarOrientation } from './bars';
import { createBars, removeBars, updateBars } from './bars-component';
import { StackedBarData, StackedBars, StackedBarsCalculator } from './stacked-bars';

export type CreateStackedBarsFunction = (
  enterSelection: Selection<EnterElement, StackedBarData, any, any>
) => Selection<SVGRectElement, StackedBarData, any, any>;

export type RemoveStackedBarsFunction = (
  exitSelection: Selection<SVGRectElement, StackedBarData, any, any>
) => void;

export type CreateBarStacksFunction = (
  enterSelection: Selection<EnterElement, any, any, any>
) => Selection<SVGGElement, any, any, any>;

export type UpdateStackedBarsFunction = (
  selection: SelectionOrTransition<BaseType, StackedBarData, any, any>
) => void;

export type StackedBarsEventData<TComponent extends Component> = ComponentEventData<TComponent> &
  StackedBarData;

export class StackedBarsComponent
  extends MediaQueryConfiguratorsMixin(ConfiguratorsMixin(LayoutTransformMixin(BaseComponent)))
  implements StackedBars {
  private _barsCalculator: StackedBarsCalculator;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateBars: CreateStackedBarsFunction;
  private _onRemoveBars: RemoveStackedBarsFunction;
  private _onCreateBarStacks: CreateBarStacksFunction;
  private _onUpdateBars: UpdateStackedBarsFunction;

  static defaultColors = categoricalColors;

  constructor() {
    super('g');
    this._barsCalculator = new StackedBarsCalculator();
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreateBars = createBars;
    this._onRemoveBars = (selection) => removeBars(selection, this._transitionDuration);
    this._onCreateBarStacks = createBarStacks;
    this._onUpdateBars = (selection) =>
      updateStackedBars(selection, StackedBarsComponent.defaultColors);
    this.classed('bars', true).classed('stacked-bars', true).attr('layout', '0, 0, 600, 400');
  }

  mainValues(): any[];
  mainValues(categories: any[]): this;
  mainValues(categories?: any) {
    if (categories === undefined) return this._barsCalculator.mainValues();
    this._barsCalculator.mainValues(categories);
    return this;
  }

  mainScale(): ScaleBand<any>;
  mainScale(scale: ScaleBand<any>): this;
  mainScale(scale?: any) {
    if (scale === undefined) return this._barsCalculator.mainScale();
    this._barsCalculator.mainScale(scale);
    return this;
  }

  crossValues(): any[][];
  crossValues(values: any[][]): this;
  crossValues(values?: any) {
    if (values === undefined) return this._barsCalculator.crossValues();
    this._barsCalculator.crossValues(values);
    return this;
  }

  crossScale(): ScaleContinuousNumeric<number, number>;
  crossScale(scale: ScaleContinuousNumeric<number, number>): this;
  crossScale(scale?: any) {
    if (scale === undefined) return this._barsCalculator.crossScale();
    this._barsCalculator.crossScale(scale);
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: any) {
    if (orientation === undefined) return this._barsCalculator.orientation();
    this._barsCalculator.orientation(orientation);
    return this;
  }

  barData(): StackedBarData[][] {
    return this._barsCalculator.barData();
  }

  keys(): string[][];
  keys(keys: null): this;
  keys(keys: string[][]): this;
  keys(keys?: string[][] | null) {
    if (keys === undefined) return this._barsCalculator.keys();
    if (keys === null) this._barsCalculator.keys(null);
    else this._barsCalculator.keys(keys);
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

  onCreateBars(): CreateStackedBarsFunction;
  onCreateBars(callback: CreateStackedBarsFunction): this;
  onCreateBars(callback?: CreateStackedBarsFunction): CreateStackedBarsFunction | this {
    if (callback === undefined) return this._onCreateBars;
    this._onCreateBars = callback;
    return this;
  }

  onRemoveBars(): RemoveStackedBarsFunction;
  onRemoveBars(callback: RemoveStackedBarsFunction): this;
  onRemoveBars(callback?: RemoveStackedBarsFunction): RemoveStackedBarsFunction | this {
    if (callback === undefined) return this._onRemoveBars;
    this._onRemoveBars = callback;
    return this;
  }

  onCreateBarStacks(): CreateBarStacksFunction;
  onCreateBarStacks(callback: CreateBarStacksFunction): this;
  onCreateBarStacks(callback?: any) {
    if (callback === undefined) return this._onCreateBarStacks;
    this._onCreateBarStacks = callback;
    return this;
  }

  onUpdateBars(): UpdateStackedBarsFunction;
  onUpdateBars(callback: UpdateStackedBarsFunction): this;
  onUpdateBars(callback?: any) {
    if (callback === undefined) return this._onUpdateBars;
    this._onUpdateBars = callback;
    return this;
  }

  afterLayout(): this {
    super.afterLayout();
    console.assert(this.attr('layout') !== null, 'layout attribute must be specified');
    this._barsCalculator.fitInSize(rectFromString(this.attr('layout')!));
    return this;
  }

  render(): this {
    super.render();

    this.selection()
      .selectAll('.bar-stack')
      .data(this.barData())
      .join(this._onCreateBarStacks)
      .selectAll<SVGRectElement, StackedBarData>('.bar')
      .data(
        (d) => d,
        (d) => d.key
      )
      .join(this._onCreateBars, undefined, this._onRemoveBars)
      .call(this._onUpdateBars);

    return this;
  }

  transition(): this {
    super.transition();

    this.selection()
      .selectAll('.bar-stack')
      .data(this.barData())
      .join(this._onCreateBarStacks)
      .selectAll<SVGRectElement, StackedBarData>('.bar')
      .data(
        (d) => d,
        (d) => d.key
      )
      .join(this._onCreateBars, undefined, this._onRemoveBars)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(this._onUpdateBars);

    return this;
  }

  eventData(event: Event): StackedBarsEventData<this> | null {
    const element = event.target as SVGRectElement;
    const barSelection = select<SVGRectElement, StackedBarData>(element);
    if (barSelection.classed('exiting')) return null;
    return {
      component: this,
      ...barSelection.datum(),
    };
  }
}

export function stackedBars(): StackedBarsComponent {
  return new StackedBarsComponent();
}

export function createBarStacks(
  enterSelection: Selection<EnterElement, any, any, any>
): Selection<SVGGElement, any, any, any> {
  return enterSelection.append('g').classed('bar-stack', true);
}

export function updateStackedBars(
  selection: SelectionOrTransition<BaseType, StackedBarData, any, any>,
  colors: string[]
): void {
  selection.call(updateBars).attr('fill', (d) => colors[d.crossIndex]);
}
