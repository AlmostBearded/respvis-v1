import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { BaseType, EnterElement, select, selection, Selection } from 'd3-selection';
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
import { GroupedBars, GroupedBarsCalculator } from './grouped-bars';

export interface GroupedBarData extends BarData {
  categoryIndex: number;
  valueIndex: number;
  rect: Rect<number>;
}

export type CreateBarGroupsFunction = (
  enterSelection: Selection<EnterElement, any, any, any>
) => Selection<SVGGElement, any, any, any>;

export type CreateGroupedBarKeyFunction = (data: GroupedBarData, index: number) => string;

export type UpdateGroupedBarsFunction = (
  selection: SelectionOrTransition<BaseType, GroupedBarData, any, any>
) => void;

export interface GroupedBarsEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  categoryIndex: number;
  valueIndex: number;
  groupElement: SVGGElement;
  element: SVGRectElement;
}

export class GroupedBarsComponent extends BaseComponent implements GroupedBars {
  private _barsCalculator: GroupedBarsCalculator;
  private _keys: string[][] | undefined;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateBars: CreateBarsFunction;
  private _onRemoveBars: RemoveBarsFunction;
  private _onCreateBarGroups: CreateBarGroupsFunction;
  private _onUpdateBars: UpdateGroupedBarsFunction;

  static defaultColors = categoricalColors;

  constructor() {
    super('g');
    this._barsCalculator = new GroupedBarsCalculator();
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreateBars = createBars;
    this._onRemoveBars = (selection) => removeBars(selection, this._transitionDuration);
    this._onCreateBarGroups = createBarGroups;
    this._onUpdateBars = (selection) =>
      updateGroupedBars(selection, GroupedBarsComponent.defaultColors);
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

  subcategoryScale(): ScaleBand<any>;
  subcategoryScale(scale: ScaleBand<any>): this;
  subcategoryScale(scale?: any) {
    if (scale === undefined) return this._barsCalculator.subcategoryScale();
    this._barsCalculator.subcategoryScale(scale);
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

  onCreateBarGroups(): CreateBarGroupsFunction;
  onCreateBarGroups(callback: CreateBarGroupsFunction): this;
  onCreateBarGroups(callback?: any) {
    if (callback === undefined) return this._onCreateBarGroups;
    this._onCreateBarGroups = callback;
    return this;
  }

  onUpdateBars(): UpdateGroupedBarsFunction;
  onUpdateBars(callback: UpdateGroupedBarsFunction): this;
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

    const groupedBarData = this.barData();

    this.selection()
      .selectAll('.bar-group')
      .data(groupedBarData)
      .join(this._onCreateBarGroups)
      .selectAll('.bar')
      .data(
        (d) => d,
        (d: GroupedBarData) => d.key
      )
      .join(this._onCreateBars, undefined, this._onRemoveBars)
      .call(this._onUpdateBars);

    return this;
  }

  transition(): this {
    super.transition();

    const groupedBarData = this.barData();

    this.selection()
      .selectAll('.bar-group')
      .data(groupedBarData)
      .join(this._onCreateBarGroups)
      .selectAll('.bar')
      .data(
        (d) => d,
        (d: GroupedBarData) => d.key
      )
      .join(this._onCreateBars, undefined, this._onRemoveBars)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(this._onUpdateBars);

    return this;
  }

  barData(): GroupedBarData[][] {
    const bars = [...this._barsCalculator.bars()];
    const groupedBars: GroupedBarData[][] = [];
    let categoryIndex = 0;
    while (bars.length) {
      groupedBars.push(
        bars.splice(0, this._barsCalculator.values()[0].length).map((rect, i) => ({
          categoryIndex: categoryIndex,
          valueIndex: i,
          key: this._keys?.[categoryIndex][i] || `${categoryIndex}/${i}`,
          rect: rect,
        }))
      );
      ++categoryIndex;
    }
    return groupedBars;
  }

  eventData(event: Event): GroupedBarsEventData<this> | null {
    const element = event.target as SVGRectElement;
    const groupElement = element.parentNode! as SVGGElement;
    const rootElement = groupElement.parentNode! as Element;

    const indexOf = Array.prototype.indexOf;

    let categoryIndex = indexOf.call(rootElement.children, groupElement);
    for (let i = 0; i <= categoryIndex; ++i)
      if (rootElement.children[i].classList.contains('exiting')) --categoryIndex;

    let valueIndex = indexOf.call(groupElement.children, element);
    for (let i = 0; i <= valueIndex; ++i)
      if (groupElement.children[i].classList.contains('exiting')) --valueIndex;

    if (categoryIndex < 0 || valueIndex < 0) return null;

    return {
      component: this,
      categoryIndex: categoryIndex,
      valueIndex: valueIndex,
      groupElement: groupElement,
      element: element,
    };
  }
}

export function groupedBars(): GroupedBarsComponent {
  return new GroupedBarsComponent();
}

export function createBarGroups(
  enterSelection: Selection<EnterElement, any, any, any>
): Selection<SVGGElement, any, any, any> {
  return enterSelection.append('g').classed('bar-group', true);
}

export function updateGroupedBars(
  selection: SelectionOrTransition<BaseType, GroupedBarData, any, any>,
  colors: string[]
): void {
  selection.call(updateBars).attr('fill', (d) => colors[d.valueIndex]);
}
