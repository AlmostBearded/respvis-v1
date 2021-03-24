import { Selection, BaseType, EnterElement, namespace } from 'd3-selection';
import { BaseComponent } from '../core';
import { BarPoints, BarPointsCalculator, BarsAccessor } from './bar-points';
import { Bars } from './bars';
import { IPosition, IStringable } from '../core/utils';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export interface LabelData {
  position: IPosition;
  text: string;
}

export type CreateLabelsFunction = (
  enterSelection: Selection<EnterElement, LabelData, any, any>
) => Selection<BaseType, any, any, any>;

// todo: add custom BarLabelEventData (or just LabelEventData?)

export class BarLabelsComponent
  extends MediaQueryConfiguratorsMixin(ConfiguratorsMixin(BaseComponent))
  implements BarPoints {
  private _barPoints: BarPoints;
  private _labels: IStringable[];
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateLabels: CreateLabelsFunction;
  // todo: add customizable removeLabels and updateLabels callbacks

  constructor(barsAccessor: BarsAccessor) {
    super('g');
    this._barPoints = new BarPointsCalculator(barsAccessor);
    this._labels = [];
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreateLabels = createLabels;
    this.classed('bar-labels', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-weight', 'normal');
  }

  barsAccessor(): BarsAccessor;
  barsAccessor(accessor: BarsAccessor): this;
  barsAccessor(accessor?: BarsAccessor): this | BarsAccessor {
    if (accessor === undefined) return this._barPoints.barsAccessor();
    this._barPoints.barsAccessor(accessor);
    return this;
  }

  labels(): IStringable[];
  labels(labels: IStringable[]): this;
  labels(labels?: any) {
    if (labels === undefined) return this._labels;
    this._labels = labels;
    return this;
  }

  heightPercent(): number;
  heightPercent(percent: number): this;
  heightPercent(percent?: any): number | this {
    if (percent === undefined) return this._barPoints.heightPercent();
    this._barPoints.heightPercent(percent);
    return this;
  }

  widthPercent(): number;
  widthPercent(percent: number): this;
  widthPercent(percent?: any): number | this {
    if (percent === undefined) return this._barPoints.widthPercent();
    this._barPoints.widthPercent(percent);
    return this;
  }

  points(): IPosition[] {
    return this._barPoints.points();
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

  onCreateLabels(): CreateLabelsFunction;
  onCreateLabels(callback: CreateLabelsFunction): this;
  onCreateLabels(callback?: CreateLabelsFunction): CreateLabelsFunction | this {
    if (callback === undefined) return this._onCreateLabels;
    this._onCreateLabels = callback;
    return this;
  }

  render(): this {
    super.render();
    const labelData: LabelData[] = this._barPoints
      .points()
      .map((p, i) => ({ position: p, text: this._labels[i].toString() }));
    this.selection()
      .selectAll('text')
      .data(labelData)
      .join(this._onCreateLabels)
      .attr('transform', (d) => `translate(${d.position.x}, ${d.position.y})`)
      .text((d) => d.text);
    return this;
  }

  transition(): this {
    super.transition();
    const labelData: LabelData[] = this._barPoints
      .points()
      .map((p, i) => ({ position: p, text: this._labels[i].toString() }));
    this.selection()
      .selectAll('text')
      .data(labelData)
      .join(this._onCreateLabels)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .attr('transform', (d) => `translate(${d.position.x}, ${d.position.y})`)
      .text((d) => d.text);
    return this;
  }
}

export function barLabels(barsAccessor: BarsAccessor): BarLabelsComponent {
  return new BarLabelsComponent(barsAccessor);
}

export function createLabels(
  enterSelection: Selection<EnterElement, LabelData, any, any>
): Selection<BaseType, any, any, any> {
  return enterSelection
    .append('text')
    .attr('transform', (d) => `translate(${d.position.x}, ${d.position.y})`)
    .text((d) => d.text);
}
