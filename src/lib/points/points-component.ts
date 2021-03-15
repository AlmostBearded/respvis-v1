import { BaseType, EnterElement, select, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import {
  BaseComponent,
  categoricalColors,
  Component,
  ComponentEventData,
  rectFromString,
  ScaleAny,
} from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';
import { IPosition } from '../core/utils';
import { PointData, Points, PointsCalculator } from './points';

export type PointsEventData<TComponent extends Component> = ComponentEventData<TComponent> &
  PointData;

export type CreatePointsFunction = (
  enterSelection: Selection<EnterElement, PointData, any, any>
) => Selection<SVGCircleElement, any, any, any>;

export type RemovePointsFunction = (exitSelection: Selection<any, PointData, any, any>) => void;

export type UpdatePointsFunction = (
  selection: SelectionOrTransition<BaseType, PointData, any, any>
) => void;

export class PointsComponent
  extends MediaQueryConfiguratorsMixin(ConfiguratorsMixin(BaseComponent))
  implements Points {
  private _calculator: PointsCalculator;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreatePoints: CreatePointsFunction;
  private _onRemovePoints: RemovePointsFunction;
  private _onUpdatePoints: UpdatePointsFunction;

  static defaultColor = categoricalColors[0];

  constructor() {
    super('g');

    this._calculator = new PointsCalculator();
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreatePoints = createPoints;
    this._onRemovePoints = (selection) => removePoints(selection, this._transitionDuration);
    this._onUpdatePoints = updatePoints;
    this.classed('points', true)
      .attr('fill', PointsComponent.defaultColor)
      .attr('layout', '0, 0, 600, 400');
  }

  mainValues(): any[];
  mainValues(values: any[]): this;
  mainValues(values?: any) {
    if (values === undefined) return this._calculator.mainValues();
    this._calculator.mainValues(values);
    return this;
  }

  mainScale(): ScaleAny<string | number | Date, number, number>;
  mainScale(scale: ScaleAny<string | number | Date, number, number>): this;
  mainScale(scale?: any) {
    if (scale === undefined) return this._calculator.mainScale();
    this._calculator.mainScale(scale);
    return this;
  }

  crossValues(): any[];
  crossValues(values: any[]): this;
  crossValues(values?: any) {
    if (values === undefined) return this._calculator.crossValues();
    this._calculator.crossValues(values);
    return this;
  }

  crossScale(): ScaleAny<string | number | Date, number, number>;
  crossScale(scale: ScaleAny<string | number | Date, number, number>): this;
  crossScale(scale?: any) {
    if (scale === undefined) return this._calculator.crossScale();
    this._calculator.crossScale(scale);
    return this;
  }

  radiuses(): any[];
  radiuses(values: any[]): this;
  radiuses(values?: any) {
    if (values === undefined) return this._calculator.radiuses();
    this._calculator.radiuses(values);
    return this;
  }

  radiusScale(): ScaleAny<string | number | Date, number, number>;
  radiusScale(scale: ScaleAny<string | number | Date, number, number>): this;
  radiusScale(scale?: any) {
    if (scale === undefined) return this._calculator.radiusScale();
    this._calculator.radiusScale(scale);
    return this;
  }

  pointData(): PointData[] {
    return this._calculator.pointData();
  }

  keys(): string[];
  keys(keys: null): this;
  keys(keys: string[]): this;
  keys(keys?: string[] | null) {
    if (keys === undefined) return this._calculator.keys();
    if (keys === null) this._calculator.keys(null);
    else this._calculator.keys(keys);
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

  onCreatePoints(): CreatePointsFunction;
  onCreatePoints(callback: CreatePointsFunction): this;
  onCreatePoints(callback?: CreatePointsFunction): CreatePointsFunction | this {
    if (callback === undefined) return this._onCreatePoints;
    this._onCreatePoints = callback;
    return this;
  }

  onRemovePoints(): RemovePointsFunction;
  onRemovePoints(callback: RemovePointsFunction): this;
  onRemovePoints(callback?: RemovePointsFunction): RemovePointsFunction | this {
    if (callback === undefined) return this._onRemovePoints;
    this._onRemovePoints = callback;
    return this;
  }

  onUpdatePoints(): UpdatePointsFunction;
  onUpdatePoints(callback: UpdatePointsFunction): this;
  onUpdatePoints(callback?: any) {
    if (callback === undefined) return this._onUpdatePoints;
    this._onUpdatePoints = callback;
    return this;
  }

  afterLayout(): this {
    super.afterLayout();
    this._calculator.fitInSize(rectFromString(this.attr('layout')));
    return this;
  }

  render(): this {
    super.render();
    this.selection()
      .selectAll('circle')
      .data(this.pointData(), (d: PointData) => d.key)
      .join(this._onCreatePoints, undefined, this._onRemovePoints)
      .call(this._onUpdatePoints);
    return this;
  }

  transition(): this {
    super.transition();
    this.selection()
      .selectAll('circle')
      .data(this.pointData(), (d: PointData) => d.key)
      .join(this._onCreatePoints, undefined, this._onRemovePoints)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(this._onUpdatePoints);
    return this;
  }

  eventData(event: Event): PointsEventData<this> | null {
    const element = event.target as SVGCircleElement;
    const pointSelection = select<SVGCircleElement, PointData>(element);
    if (pointSelection.classed('exiting')) return null;
    return {
      component: this,
      ...pointSelection.datum(),
    };
  }
}

export function points(): PointsComponent {
  return new PointsComponent();
}

export function createPoints(
  enterSelection: Selection<EnterElement, PointData, any, any>
): Selection<SVGCircleElement, any, any, any> {
  return enterSelection
    .append('circle')
    .classed('point', true)
    .attr('cx', (d) => d.center.x)
    .attr('cy', (d) => d.center.y)
    .attr('r', 0);
}

export function removePoints(
  exitSelection: Selection<any, PointData, any, any>,
  transitionDuration: number
): void {
  exitSelection
    .classed('exiting', true)
    .transition()
    .duration(transitionDuration)
    .attr('r', 0)
    .remove();
}

export function updatePoints(
  selection: SelectionOrTransition<BaseType, PointData, any, any>
): void {
  selection
    .attr('cx', (d) => d.center.x)
    .attr('cy', (d) => d.center.y)
    .attr('r', (d) => d.radius);
}
