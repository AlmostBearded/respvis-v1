import {
  Rect,
  renderClippedRect,
  colors,
  utils,
  Component,
  IComponent,
  IComponentConfig,
  chroma,
  IComponentEventData,
  setUniformNestedAttributes,
  _setNestedAttributes,
  IScaleConfig,
  IBandScaleConfig,
  bandScale,
  linearScale,
  IAttributes,
  setAttributes,
  clipByItself,
  transitionAttributes,
} from '../core';
import { select, Selection, BaseType, create } from 'd3-selection';
import { IStringable } from '../core/utils';

export enum BarOrientation {
  Vertical,
  Horizontal,
}

export interface IBars {
  bars(): Rect[];
}

export interface IBarPositionerConfig {
  categories: any[];
  categoryScale: IBandScaleConfig;
  values: number[];
  valueScale: IScaleConfig<number, number, number>;
  orientation: BarOrientation;
}

export interface IBarsComponentConfig extends IComponentConfig, IBarPositionerConfig {
  createBars: (
    selection: Selection<BaseType, IAttributes, any, unknown>
  ) => Selection<SVGRectElement, IAttributes, any, unknown>;
  transitionDuration: number;
  events: utils.IDictionary<(event: Event, data: IBarsEventData) => void>;
}

export interface IBarPositioner extends IBars {
  config(config: IBarPositionerConfig): this;
  config(): IBarPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export interface IBarsComponent extends IComponent<IBarsComponentConfig>, IBars {}

export interface IBarsEventData extends IComponentEventData {
  index: number;
  barElement: SVGRectElement;
}

const defaultBarPositionerConfig: IBarPositionerConfig = {
  categories: [],
  categoryScale: { scale: bandScale(), domain: [], padding: 0.1 },
  values: [],
  valueScale: { scale: linearScale<number, number>(), domain: [] },
  orientation: BarOrientation.Vertical,
};

export class BarPositioner implements IBarPositioner {
  private _config: IBarPositionerConfig;
  private _bars: Rect[] = [];

  constructor() {
    this._config = defaultBarPositionerConfig;
  }

  config(config: IBarPositionerConfig): this;
  config(): IBarPositionerConfig;
  config(config?: IBarPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);
    this._config.categoryScale.scale
      .domain(this._config.categories)
      .padding(this._config.categoryScale.padding);
    this._config.valueScale.scale.domain(this._config.valueScale.domain);
    return this;
  }

  fitInSize(size: utils.ISize): this {
    const categoryScale = this._config.categoryScale.scale,
      valueScale = this._config.valueScale.scale;

    if (this._config.orientation === BarOrientation.Vertical) {
      categoryScale.range([0, size.width]);
      valueScale.range([size.height, 0]);
    } else if (this._config.orientation === BarOrientation.Horizontal) {
      categoryScale.range([0, size.height]);
      valueScale.range([0, size.width]);
    }

    this._bars = [];

    for (let i = 0; i < this._config.values.length; ++i) {
      const c = this._config.categories[i];
      const v = this._config.values[i];

      if (this._config.orientation === BarOrientation.Vertical) {
        this._bars.push({
          x: categoryScale(c)!,
          y: Math.min(valueScale(0)!, valueScale(v)!),
          width: categoryScale.bandwidth(),
          height: Math.abs(valueScale(0)! - valueScale(v)!),
        });
      } else if (this._config.orientation === BarOrientation.Horizontal) {
        this._bars.push({
          x: Math.min(valueScale(0)!, valueScale(v)!),
          y: categoryScale(c)!,
          width: Math.abs(valueScale(0)! - valueScale(v)!),
          height: categoryScale.bandwidth(),
        });
      }
    }

    return this;
  }

  bars(): Rect[] {
    return this._bars;
  }
}

export class BarsComponent extends Component<IBarsComponentConfig> implements IBarsComponent {
  private _barPositioner: IBarPositioner = new BarPositioner();

  static defaultColor = colors.categorical[0];

  static setEventListeners(component: BarsComponent, config: IBarsComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        const barElement = e.target as SVGRectElement;
        const index = Array.prototype.indexOf.call(barElement.parentNode!.children, barElement);
        config.events[typenames](e, {
          component: component,
          index: index,
          barElement: barElement,
        });
      });
    }
  }

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('bars', true),
      {
        ...defaultBarPositionerConfig,
        createBars: createBars,
        transitionDuration: 0,
        attributes: {
          '.bar': {
            fill: BarsComponent.defaultColor,
            stroke: '#232323',
            'stroke-width': 1,
          },
        },
        responsiveConfigs: {},
        events: {},
        parseConfig: (previousConfig: IBarsComponentConfig, newConfig: IBarsComponentConfig) => {},
        applyConfig: (previousConfig: IBarsComponentConfig, newConfig: IBarsComponentConfig) => {
          BarsComponent.clearEventListeners(this, previousConfig);
          BarsComponent.setEventListeners(this, newConfig);
          this._barPositioner.config(newConfig);
        },
      },
      Component.mergeConfigs
    );
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    return this;
  }

  render(animated: boolean): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout') || '0, 0, 600, 400');
    this._barPositioner.fitInSize(layoutRect);

    const config = this.activeConfig();

    const attributes: IAttributes[] = this._barPositioner.bars().map((bar) => ({ ...bar }));

    const barsSelection = this.selection()
      .selectAll<SVGElement, IAttributes>('rect')
      .data(attributes)
      .join(config.createBars);

    if (animated && config.transitionDuration > 0)
      barsSelection.transition().duration(config.transitionDuration).call(transitionAttributes);
    else barsSelection.call(setAttributes);

    this.selection().datum(config.attributes).call(setUniformNestedAttributes).datum(null);

    return this;
  }

  bars(): Rect[] {
    return this._barPositioner.bars();
  }
}

export function barPositioner(): BarPositioner {
  return new BarPositioner();
}

export function bars(): BarsComponent {
  return new BarsComponent();
}

export function createBars(
  selection: Selection<BaseType, IAttributes, SVGElement, unknown>
): Selection<SVGRectElement, IAttributes, SVGElement, unknown> {
  return selection.append('rect').classed('bar', true).call(setAttributes);
}

export function createClippedBars(
  selection: Selection<BaseType, IAttributes, SVGElement, unknown>
): Selection<SVGRectElement, IAttributes, SVGElement, unknown> {
  return selection.append('rect').classed('bar', true).call(clipByItself).call(setAttributes);
}
