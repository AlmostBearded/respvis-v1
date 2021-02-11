import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { BaseType, EnterElement, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import {
  BaseComponent,
  categoricalColors,
  Component,
  ComponentEventData,
  Rect,
  rectFromString,
} from '../core';
import { BarOrientation } from './bars';
import {
  BarData,
  createBars,
  CreateBarsFunction,
  removeBars,
  RemoveBarsFunction,
  updateBars,
} from './bars-component';
import { StackedBars, StackedBarsCalculator } from './stacked-bars';

export interface StackedBarData extends BarData {
  categoryIndex: number;
  valueIndex: number;
  rect: Rect<number>;
}

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

export interface StackedBarsEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  stackIndex: number;
  barIndex: number;
  key: string;
  stackElement: SVGGElement;
  element: SVGRectElement;
}

export class StackedBarsComponent extends BaseComponent implements StackedBars {
  private _barsCalculator: StackedBarsCalculator;
  private _keys: string[][] | undefined;
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
  }

  categories(): any[];
  categories(categories: any[]): this;
  categories(categories?: any) {
    if (categories === undefined) return this._barsCalculator.categories();
    this._barsCalculator.categories(categories);
    return this;
  }

  categoryScale(): ScaleBand<any>;
  categoryScale(scale: ScaleBand<any>): this;
  categoryScale(scale?: any) {
    if (scale === undefined) return this._barsCalculator.categoryScale();
    this._barsCalculator.categoryScale(scale);
    return this;
  }

  values(): any[][];
  values(values: any[][]): this;
  values(values?: any) {
    if (values === undefined) return this._barsCalculator.values();
    this._barsCalculator.values(values);
    return this;
  }

  valueScale(): ScaleContinuousNumeric<number, number>;
  valueScale(scale: ScaleContinuousNumeric<number, number>): this;
  valueScale(scale?: any) {
    if (scale === undefined) return this._barsCalculator.valueScale();
    this._barsCalculator.valueScale(scale);
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: any) {
    if (orientation === undefined) return this._barsCalculator.orientation();
    this._barsCalculator.orientation(orientation);
    return this;
  }

  bars(): Rect<number>[] {
    return this._barsCalculator.bars();
  }

  keys(): string[][];
  keys(keys: null): this;
  keys(keys: string[][]): this;
  keys(keys?: string[][] | null) {
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

  key(categoryIndex: number, valueIndex: number): string {
    return this._keys?.[categoryIndex][valueIndex] || `${categoryIndex}/${valueIndex}`;
  }

  barData(): StackedBarData[][] {
    const bars = [...this._barsCalculator.bars()];
    const data: StackedBarData[][] = [];
    let categoryIndex = 0;
    while (bars.length) {
      data.push(
        bars.splice(0, this._barsCalculator.values()[0].length).map((rect, i) => ({
          categoryIndex: categoryIndex,
          valueIndex: i,
          key: this.key(categoryIndex, i),
          rect: rect,
        }))
      );
      ++categoryIndex;
    }
    return data;
  }

  afterLayout(): this {
    super.afterLayout();
    this._barsCalculator.fitInSize(rectFromString(this.attr('layout')));
    return this;
  }

  render(): this {
    super.render();

    const barData = this.barData();

    this.selection()
      .selectAll('.bar-stack')
      .data(barData)
      .join(this._onCreateBarStacks)
      .selectAll('.bar')
      .data(
        (d) => d,
        (d: StackedBarData) => d.key
      )
      .join(this._onCreateBars, undefined, this._onRemoveBars)
      .call(this._onUpdateBars);

    return this;
  }

  transition(): this {
    super.transition();

    const groupedBarData = this.barData();

    this.selection()
      .selectAll('.bar-stack')
      .data(groupedBarData)
      .join(this._onCreateBarStacks)
      .selectAll('.bar')
      .data(
        (d) => d,
        (d: StackedBarData) => d.key
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
    const stackElement = element.parentNode! as SVGGElement;
    const rootElement = stackElement.parentNode! as Element;

    const indexOf = Array.prototype.indexOf;

    let stackIndex = indexOf.call(rootElement.children, stackElement);
    for (let i = 0; i <= stackIndex; ++i)
      if (rootElement.children[i].classList.contains('exiting')) --stackIndex;

    let barIndex = indexOf.call(stackElement.children, element);
    for (let i = 0; i <= barIndex; ++i)
      if (stackElement.children[i].classList.contains('exiting')) --barIndex;

    if (stackIndex < 0 || barIndex < 0) return null;

    return {
      component: this,
      stackIndex: stackIndex,
      barIndex: barIndex,
      key: this.key(stackIndex, barIndex),
      stackElement: stackElement,
      element: element,
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
  selection.call(updateBars).attr('fill', (d) => colors[d.valueIndex]);
}
