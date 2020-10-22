import { Selection, select, BaseType, create } from 'd3-selection';
import { axisLeft, axisBottom, axisTop, axisRight, AxisScale, Axis as D3Axis } from 'd3-axis';
import { Component, IComponent, IComponentConfig, MergeConfigsFn } from '../component';
import { ITicks, ITicksConfig, Position, Ticks } from './ticks';
import { Group, IGroup, IGroupConfig } from './group';
import {
  Text,
  IText,
  ITextConfig,
  verticalTextAttributes,
  titleAttributes,
} from './text';
import { deepExtend } from '../utils';

export interface IAxisConfig extends IComponentConfig {
  ticks: ITicksConfig;
  title: ITextConfig;
}

export interface IAxis extends IComponent<IAxisConfig> {}

const ticksGridAreaByPosition = new Map([
  [Position.Left, { 'grid-area': '1 / 3 / 2 / 4' }],
  [Position.Bottom, { 'grid-area': '1 / 1 / 2 / 2' }],
  [Position.Right, { 'grid-area': '1 / 1 / 2 / 2' }],
  [Position.Top, { 'grid-area': '3 / 1 / 4 / 2' }],
]);

const titleAttributesByPosition = new Map([
  [Position.Left, { 'grid-area': '1 / 1 / 2 / 2', ...verticalTextAttributes }],
  [Position.Bottom, { 'grid-area': '3 / 1 / 4 / 2' }],
  [Position.Right, { 'grid-area': '1 / 3 / 2 / 4', ...verticalTextAttributes }],
  [Position.Top, { 'grid-area': '1 / 1 / 2 / 2' }],
]);

const groupAttributesByPosition = new Map([
  [Position.Left, { 'grid-template': 'auto / auto 5 auto' }],
  [Position.Bottom, { 'grid-template': 'auto 5 auto / auto' }],
  [Position.Right, { 'grid-template': 'auto / auto 5 auto' }],
  [Position.Top, { 'grid-template': 'auto 5 auto / auto' }],
]);

export class Axis extends Component<IAxisConfig> implements IAxis {
  private _group: IGroup;
  private _ticks: ITicks;
  private _title: IText;

  static mergeConfigs = function mergeConfigs(
    target: Partial<IAxisConfig>,
    source: Partial<IAxisConfig>
  ): Partial<IAxisConfig> {
    return Object.assign(target, source, {
      attributes: deepExtend(target.attributes || {}, source.attributes || {}),
      ticks: Ticks.mergeConfigs(target.ticks || {}, source.ticks || {}),
      title: Text.mergeConfigs(target.title || {}, source.title || {}),
    });
  } as MergeConfigsFn;

  constructor(axisPosition: Position) {
    const ticks = new Ticks(axisPosition).config({
      attributes: { ...ticksGridAreaByPosition.get(axisPosition)! },
    });

    const title = new Text().config({
      attributes: {
        'place-self': 'center',
        ...titleAttributes,
        ...titleAttributesByPosition.get(axisPosition)!,
      },
    });

    const group = new Group().config({
      attributes: {
        ...groupAttributesByPosition.get(axisPosition),
      },
      children: [ticks, title],
    });

    super(
      group.selection(),
      {
        ticks: ticks.config(),
        title: title.config(),
        attributes: group.config().attributes,
        conditionalConfigs: [],
      },
      Axis.mergeConfigs
    );

    this._group = group;
    this._ticks = ticks;
    this._title = title;

    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IAxisConfig): void {
    this._title.config(config.title);
    this._ticks.config(config.ticks);
    this._group.config({ attributes: config.attributes });
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._group.mount(selection);
    return this;
  }

  render(animated: boolean): this {
    this._group.render(animated);
    return this;
  }

  resize(): this {
    this._group.resize();
    return this;
  }

  protected _afterResize(): void {
    this._group.afterResize();
  }

  renderOrder(): number {
    return 10;
  }
}

export function axis(axisPosition: Position): Axis {
  return new Axis(axisPosition);
}

export function leftAxis(): Axis {
  return new Axis(Position.Left);
}

export function bottomAxis(): Axis {
  return new Axis(Position.Bottom);
}

export function rightAxis(): Axis {
  return new Axis(Position.Right);
}

export function topAxis(): Axis {
  return new Axis(Position.Top);
}
