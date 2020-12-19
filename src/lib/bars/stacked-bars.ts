import {
  colors,
  Component,
  IComponent,
  IComponentConfig,
  Rect,
  utils,
  IComponentEventData,
  setUniformNestedAttributes,
  IBandScaleConfig,
  IScaleConfig,
  IAttributes,
  bandScale,
  linearScale,
  transitionAttributes,
  setAttributes,
} from '../core';
import { Selection, BaseType, create } from 'd3-selection';
import { BarOrientation, createBars, IBars } from './bars';

export interface IStackedBarPositionerConfig {
  categories: string[];
  categoryScale: IBandScaleConfig;
  values: number[][];
  valueScale: IScaleConfig<number, number, number>;
  orientation: BarOrientation;
}

export interface IStackedBarsComponentConfig extends IComponentConfig, IStackedBarPositionerConfig {
  createBars: (
    selection: Selection<BaseType, IAttributes, any, any>
  ) => Selection<SVGRectElement, IAttributes, any, any>;
  createBarStacks: (
    selection: Selection<BaseType, any, any, unknown>
  ) => Selection<SVGGElement, any, any, unknown>;
  transitionDuration: number;
  events: utils.IDictionary<(event: Event, data: IStackedBarsEventData) => void>;
}

export interface IStackedBarsEventData extends IComponentEventData {
  categoryIndex: number;
  barIndex: number;
  barElement: SVGRectElement;
  barStackElement: SVGGElement;
}

export interface IStackedBarPositioner extends IBars {
  config(config: IStackedBarPositionerConfig): this;
  config(): IStackedBarPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export interface IStackedBarsComponent extends IComponent<IStackedBarsComponentConfig>, IBars {}

const defaultStackedBarPositionerConfig: IStackedBarPositionerConfig = {
  categories: [],
  categoryScale: { scale: bandScale(), domain: [], padding: 0.1 },
  values: [],
  valueScale: { scale: linearScale<number>(), domain: [] },
  orientation: BarOrientation.Vertical,
};

export class StackedBarPositioner implements IStackedBarPositioner {
  private _config: IStackedBarPositionerConfig;
  private _bars: Rect[] = [];

  constructor() {
    this._config = defaultStackedBarPositionerConfig;
  }

  config(config: IStackedBarPositionerConfig): this;
  config(): IStackedBarPositionerConfig;
  config(config?: IStackedBarPositionerConfig): any {
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

    for (let i = 0; i < this._config.categories.length; ++i) {
      const subcategoryValues = this._config.values[i];
      let sum = 0;
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._config.categories[i];
        const v = subcategoryValues[j];

        if (this._config.orientation === BarOrientation.Vertical) {
          this._bars.push({
            x: categoryScale(c)!,
            y: -sum + Math.min(valueScale(0)!, valueScale(v)!),
            width: categoryScale.bandwidth(),
            height: Math.abs(valueScale(0)! - valueScale(v)!),
          });
          sum += this._bars[this._bars.length - 1].height;
        } else if (this._config.orientation === BarOrientation.Horizontal) {
          this._bars.push({
            x: sum + Math.min(valueScale(0)!, valueScale(v)!),
            y: categoryScale(c)!,
            width: Math.abs(valueScale(0)! - valueScale(v)!),
            height: categoryScale.bandwidth(),
          });
          sum += this._bars[this._bars.length - 1].width;
        }
      }
    }

    return this;
  }

  bars(): Rect[] {
    return this._bars;
  }
}

export class StackedBarsComponent
  extends Component<IStackedBarsComponentConfig>
  implements IStackedBarsComponent {
  private _barPositioner: IStackedBarPositioner = new StackedBarPositioner();

  static defaultColors = colors.categorical;

  static setEventListeners(component: StackedBarsComponent, config: IStackedBarsComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        const barElement = e.target as SVGRectElement;
        const barStackElement = barElement.parentNode!;

        const indexOf = Array.prototype.indexOf;
        const categoryIndex = indexOf.call(barStackElement.parentNode!.children, barStackElement);
        const barIndex = indexOf.call(barStackElement.children, barElement);

        config.events[typenames](e, {
          component: component,
          categoryIndex: categoryIndex,
          barIndex: barIndex,
          barStackElement: barStackElement as SVGGElement,
          barElement: barElement,
        });
      });
    }
  }

  constructor() {
    super(
      create<SVGGElement>('svg:g').classed('stacked-bars', true),
      {
        ...defaultStackedBarPositionerConfig,
        createBarStacks: createBarStacks,
        createBars: createBars,
        transitionDuration: 0,
        attributes: Object.assign(
          { '.bar': { stroke: '#232323', 'stroke-width': 1 } },
          ...StackedBarsComponent.defaultColors.map((c, i) => ({
            [`.bar:nth-child(${i + 1})`]: { fill: c },
          }))
        ),
        responsiveConfigs: {},
        events: {},
        parseConfig: (
          previousConfig: IStackedBarsComponentConfig,
          newConfig: IStackedBarsComponentConfig
        ) => {},
        applyConfig: (
          previousConfig: IStackedBarsComponentConfig,
          newConfig: IStackedBarsComponentConfig
        ) => {
          StackedBarsComponent.clearEventListeners(this, previousConfig);
          StackedBarsComponent.setEventListeners(this, newConfig);
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

    const flatBarAttributes: IAttributes[] = this._barPositioner.bars().map((bar) => ({ ...bar }));
    const barAttributes: IAttributes[][] = [];
    while (flatBarAttributes.length) {
      barAttributes.push(flatBarAttributes.splice(0, config.values[0].length));
    }

    const barsSelection = this.selection()
      .selectAll('.bar-stack')
      .data(barAttributes)
      .join(config.createBarStacks)
      .selectAll('.bar')
      .data((d) => d)
      .join(config.createBars);

    if (animated && config.transitionDuration > 0)
      barsSelection.transition().duration(config.transitionDuration).call(transitionAttributes);
    else barsSelection.call(setAttributes);

    this.selection()
      .datum(this.activeConfig().attributes)
      .call(setUniformNestedAttributes)
      .datum(null);

    return this;
  }

  bars(): Rect[] {
    return this._barPositioner.bars();
  }
}

export function stackedBarPositioner(): StackedBarPositioner {
  return new StackedBarPositioner();
}

export function stackedBars(): StackedBarsComponent {
  return new StackedBarsComponent();
}

export function createBarStacks(
  selection: Selection<BaseType, unknown, SVGElement, unknown>
): Selection<SVGGElement, unknown, SVGElement, unknown> {
  return selection.append('g').classed('bar-stack', true);
}
