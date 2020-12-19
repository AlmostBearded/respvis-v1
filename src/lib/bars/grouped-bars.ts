import {
  Component,
  IComponent,
  IComponentConfig,
  utils,
  colors,
  Rect,
  IComponentEventData,
  setUniformNestedAttributes,
  IBandScaleConfig,
  IScaleConfig,
  bandScale,
  linearScale,
  IAttributes,
  transitionAttributes,
  setAttributes,
} from '../core';
import { BaseType, Selection, select, create } from 'd3-selection';
import { range } from 'd3-array';
import { BarOrientation, createBars, IBars } from './bars';

export interface IGroupedBarPositionerConfig {
  categories: string[];
  categoryScale: IBandScaleConfig;
  subcategoryScale: IBandScaleConfig;
  values: number[][];
  valueScale: IScaleConfig<number, number, number>;
  orientation: BarOrientation;
}

export interface IGroupedBarsComponentConfig extends IComponentConfig, IGroupedBarPositionerConfig {
  createBars: (
    selection: Selection<BaseType, IAttributes, any, any>
  ) => Selection<SVGRectElement, IAttributes, any, any>;
  createBarGroups: (
    selection: Selection<BaseType, any, any, any>
  ) => Selection<SVGGElement, any, any, any>;
  transitionDuration: number;
  events: utils.IDictionary<(event: Event, data: IGroupedBarsEventData) => void>;
}

export interface IGroupedBarsEventData extends IComponentEventData {
  categoryIndex: number;
  barIndex: number;
  barGroupElement: SVGGElement;
  barElement: SVGRectElement;
}

export interface IGroupedBarPositioner extends IBars {
  config(config: IGroupedBarPositionerConfig): this;
  config(): IGroupedBarPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export interface IGroupedBarsComponent extends IComponent<IGroupedBarsComponentConfig>, IBars {}

const defaultGroupedBarPositionerConfig: IGroupedBarPositionerConfig = {
  categories: [],
  categoryScale: { scale: bandScale(), domain: [], padding: 0.1 },
  subcategoryScale: { scale: bandScale(), domain: [], padding: 0.1 },
  values: [],
  valueScale: { scale: linearScale<number>(), domain: [] },
  orientation: BarOrientation.Vertical,
};

export class GroupedBarPositioner implements IGroupedBarPositioner {
  private _config: IGroupedBarPositionerConfig;
  private _bars: Rect[] = [];

  constructor() {
    this._config = defaultGroupedBarPositionerConfig;
  }

  config(config: IGroupedBarPositionerConfig): this;
  config(): IGroupedBarPositionerConfig;
  config(config?: IGroupedBarPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);
    this._config.categoryScale.scale
      .domain(this._config.categories)
      .padding(this._config.categoryScale.padding);
    this._config.subcategoryScale.scale
      .domain(range(this._config.values[0]?.length || 0))
      .padding(this._config.subcategoryScale.padding);
    this._config.valueScale.scale.domain(this._config.valueScale.domain);
    return this;
  }

  fitInSize(size: utils.ISize): this {
    const categoryScale = this._config.categoryScale.scale,
      subcategoriesScale = this._config.subcategoryScale.scale,
      valueScale = this._config.valueScale.scale;

    if (this._config.orientation === BarOrientation.Vertical) {
      categoryScale.range([0, size.width]);
      valueScale.range([size.height, 0]);
    } else if (this._config.orientation === BarOrientation.Horizontal) {
      categoryScale.range([0, size.height]);
      valueScale.range([0, size.width]);
    }
    subcategoriesScale.range([0, categoryScale.bandwidth()]);

    this._bars = [];

    for (let i = 0; i < this._config.values.length; ++i) {
      const subcategoryValues = this._config.values[i];
      for (let j = 0; j < subcategoryValues.length; ++j) {
        const c = this._config.categories[i];
        const v = subcategoryValues[j];

        if (this._config.orientation === BarOrientation.Vertical) {
          this._bars.push({
            x: categoryScale(c)! + subcategoriesScale(j)!,
            y: Math.min(valueScale(0)!, valueScale(v)!),
            width: subcategoriesScale.bandwidth(),
            height: Math.abs(valueScale(0)! - valueScale(v)!),
          });
        } else if (this._config.orientation === BarOrientation.Horizontal) {
          this._bars.push({
            x: Math.min(valueScale(0)!, valueScale(v)!),
            y: categoryScale(c)! + subcategoriesScale(j)!,
            width: Math.abs(valueScale(0)! - valueScale(v)!),
            height: subcategoriesScale.bandwidth(),
          });
        }
      }
    }

    return this;
  }

  bars(): Rect[] {
    return this._bars;
  }
}

export class GroupedBarsComponent
  extends Component<IGroupedBarsComponentConfig>
  implements IGroupedBarsComponent {
  private _barPositioner: IGroupedBarPositioner = new GroupedBarPositioner();

  static defaultColors = colors.categorical;

  static setEventListeners(component: GroupedBarsComponent, config: IGroupedBarsComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        const barElement = e.target as SVGRectElement;
        const barGroupElement = barElement.parentNode!;

        const indexOf = Array.prototype.indexOf;
        const categoryIndex = indexOf.call(barGroupElement.parentNode!.children, barGroupElement);
        const barIndex = indexOf.call(barGroupElement.children, barElement);

        config.events[typenames](e, {
          component: component,
          categoryIndex: categoryIndex,
          barIndex: barIndex,
          barGroupElement: barGroupElement as SVGGElement,
          barElement: barElement as SVGRectElement,
        });
      });
    }
  }

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('bars', true),
      {
        ...defaultGroupedBarPositionerConfig,
        createBars: createBars,
        createBarGroups: createBarGroups,
        transitionDuration: 0,
        attributes: Object.assign(
          { '.bar': { stroke: '#232323', 'stroke-width': 1 } },
          ...GroupedBarsComponent.defaultColors.map((c, i) => ({
            [`.bar:nth-child(${i + 1})`]: { fill: c },
          }))
        ),
        responsiveConfigs: {},
        events: {},
        parseConfig: (
          previousConfig: IGroupedBarsComponentConfig,
          newConfig: IGroupedBarsComponentConfig
        ) => {},
        applyConfig: (
          previousConfig: IGroupedBarsComponentConfig,
          newConfig: IGroupedBarsComponentConfig
        ) => {
          GroupedBarsComponent.clearEventListeners(this, previousConfig);
          GroupedBarsComponent.setEventListeners(this, newConfig);
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
      .selectAll('.bar-group')
      .data(barAttributes)
      .join(config.createBarGroups)
      .selectAll('.bar')
      .data((d) => d)
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

export function groupedBarPositioner(): GroupedBarPositioner {
  return new GroupedBarPositioner();
}

export function groupedBars(): GroupedBarsComponent {
  return new GroupedBarsComponent();
}

export function createBarGroups(
  selection: Selection<BaseType, unknown, SVGElement, unknown>
): Selection<SVGGElement, unknown, SVGElement, unknown> {
  return selection.append('g').classed('bar-group', true);
}
