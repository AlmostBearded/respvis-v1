import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { BaseType, EnterElement, select, selection, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import { colors, Component, ComponentDecorator, ComponentEventData, IRect, Rect } from '../core';
import { ContainerComponent } from '../core/components/container-component';
import { BarOrientation, BarsCalculator } from './bars';
import {
  BarData,
  BarsDecorator,
  createBars,
  CreateBarsFunction,
  updateBars,
} from './bars-decorator';
import { GroupedBars, GroupedBarsCalculator } from './grouped-bars';

export interface GroupedBarData extends BarData {
  categoryIndex: number;
  valueIndex: number;
  rect: IRect<number>;
}

export type CreateBarGroupsFunction = (
  enterSelection: Selection<EnterElement, any, any, any>
) => Selection<SVGGElement, any, any, any>;

export type UpdateBarsFunction = (
  selection: SelectionOrTransition<BaseType, GroupedBarData, any, any>
) => void;

export interface GroupedBarsEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  categoryIndex: number;
  valueIndex: number;
  groupElement: SVGGElement;
  element: SVGRectElement;
}

export class GroupedBarsDecorator<TComponent extends ContainerComponent>
  extends ComponentDecorator<TComponent>
  implements GroupedBars {
  private _barsCalculator: GroupedBarsCalculator;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateBars: CreateBarsFunction;
  private _onCreateBarGroups: CreateBarGroupsFunction;
  private _onUpdateBars: UpdateBarsFunction;

  static defaultColors = colors.categorical;

  constructor(component: TComponent) {
    super(component);
    this._barsCalculator = new GroupedBarsCalculator();
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreateBars = createBars;
    this._onCreateBarGroups = createBarGroups;
    this._onUpdateBars = updateGroupedBars;
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

  bars(): IRect<number>[] {
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

  onCreateBarGroups(): CreateBarGroupsFunction;
  onCreateBarGroups(callback: CreateBarGroupsFunction): this;
  onCreateBarGroups(callback?: any) {
    if (callback === undefined) return this._onCreateBarGroups;
    this._onCreateBarGroups = callback;
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
    this._barsCalculator.fitInSize(Rect.fromString(this.component().attr('layout')));
    return this;
  }

  render(): this {
    super.render();

    const bars = [...this._barsCalculator.bars()];
    const groupedBars: GroupedBarData[][] = [];
    let categoryIndex = 0;
    while (bars.length) {
      groupedBars.push(
        bars
          .splice(0, this._barsCalculator.values()[0].length)
          .map((rect, i) => ({ categoryIndex: categoryIndex++, valueIndex: i, rect: rect }))
      );
    }

    this.component()
      .selection()
      .selectAll('.bar-group')
      .data(groupedBars)
      .join(this._onCreateBarGroups)
      .selectAll('.bar')
      .data((d) => d)
      .join(this._onCreateBars)
      .call(this._onUpdateBars);

    return this;
  }

  transition(): this {
    super.transition();

    const bars = [...this._barsCalculator.bars()];
    const groupedBars: GroupedBarData[][] = [];
    let categoryIndex = 0;
    while (bars.length) {
      groupedBars.push(
        bars
          .splice(0, this._barsCalculator.values()[0].length)
          .map((rect, i) => ({ categoryIndex: categoryIndex, valueIndex: i, rect: rect }))
      );
      ++categoryIndex;
    }

    this.component()
      .selection()
      .selectAll('.bar-group')
      .data(groupedBars)
      .join(this._onCreateBarGroups)
      .selectAll('.bar')
      .data((d) => d)
      .join(this._onCreateBars)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(this._onUpdateBars);

    return this;
  }

  eventData(event: Event): GroupedBarsEventData<this> {
    const element = event.target as SVGRectElement;
    const groupElement = element.parentNode! as SVGGElement;

    const indexOf = Array.prototype.indexOf;
    const categoryIndex = indexOf.call(groupElement.parentNode!.children, groupElement);
    const valueIndex = indexOf.call(groupElement.children, element);

    return {
      component: this,
      categoryIndex: categoryIndex,
      valueIndex: valueIndex,
      groupElement: groupElement,
      element: element,
    };
  }
}

export function createBarGroups(
  enterSelection: Selection<EnterElement, any, any, any>
): Selection<SVGGElement, any, any, any> {
  return enterSelection.append('g').classed('bar-group', true);
}

export function updateGroupedBars(
  selection: SelectionOrTransition<BaseType, GroupedBarData, any, any>
): void {
  selection.call(updateBars).attr('fill', (d) => GroupedBarsDecorator.defaultColors[d.valueIndex]);
}
