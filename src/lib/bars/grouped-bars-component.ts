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
import { BarOrientation, barsCalculator } from './bars';
import { createBars, removeBars, updateBars } from './bars-component';
import { GroupedBarData, GroupedBars, GroupedBarsCalculator } from './grouped-bars';

export type CreateGroupedBarsFunction = (
  enterSelection: Selection<EnterElement, GroupedBarData, any, any>
) => Selection<SVGRectElement, GroupedBarData, any, any>;

export type RemoveGroupedBarsFunction = (
  exitSelection: Selection<SVGRectElement, GroupedBarData, any, any>
) => void;

export type CreateBarGroupsFunction = (
  enterSelection: Selection<EnterElement, GroupedBarData[], any, any>
) => Selection<SVGGElement, GroupedBarData[], any, any>;

export type UpdateGroupedBarsFunction = (
  selection: SelectionOrTransition<BaseType, GroupedBarData, any, any>
) => void;

export type GroupedBarsEventData<TComponent extends Component> = ComponentEventData<TComponent> &
  GroupedBarData;

export class GroupedBarsComponent extends BaseComponent implements GroupedBars {
  private _barsCalculator: GroupedBarsCalculator;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateBars: CreateGroupedBarsFunction;
  private _onRemoveBars: RemoveGroupedBarsFunction;
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
    this.classed('bars', true).classed('grouped-bars', true).attr('layout', '0, 0, 600, 400');
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

  mainInnerScale(): ScaleBand<any>;
  mainInnerScale(scale: ScaleBand<any>): this;
  mainInnerScale(scale?: any) {
    if (scale === undefined) return this._barsCalculator.mainInnerScale();
    this._barsCalculator.mainInnerScale(scale);
    return this;
  }

  orientation(): BarOrientation;
  orientation(orientation: BarOrientation): this;
  orientation(orientation?: any) {
    if (orientation === undefined) return this._barsCalculator.orientation();
    this._barsCalculator.orientation(orientation);
    return this;
  }

  barData(): GroupedBarData[][] {
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

  onCreateBars(): CreateGroupedBarsFunction;
  onCreateBars(callback: CreateGroupedBarsFunction): this;
  onCreateBars(callback?: CreateGroupedBarsFunction): CreateGroupedBarsFunction | this {
    if (callback === undefined) return this._onCreateBars;
    this._onCreateBars = callback;
    return this;
  }

  onRemoveBars(): RemoveGroupedBarsFunction;
  onRemoveBars(callback: RemoveGroupedBarsFunction): this;
  onRemoveBars(callback?: RemoveGroupedBarsFunction): RemoveGroupedBarsFunction | this {
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
      .data(this._barsCalculator.barData())
      .join(this._onCreateBarGroups)
      .selectAll<SVGRectElement, GroupedBarData>('.bar')
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

    const groupedBarData = this.barData();

    this.selection()
      .selectAll('.bar-group')
      .data(this._barsCalculator.barData())
      .join(this._onCreateBarGroups)
      .selectAll<SVGRectElement, GroupedBarData>('.bar')
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

  eventData(event: Event): GroupedBarsEventData<this> | null {
    const barElement = event.target as SVGRectElement;
    const barSelection = select<SVGRectElement, GroupedBarData>(barElement);
    if (barSelection.classed('exiting')) return null;
    return {
      component: this,
      ...barSelection.datum(),
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
  selection.call(updateBars).attr('fill', (d) => colors[d.crossIndex]);
}
