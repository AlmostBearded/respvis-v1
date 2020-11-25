import {
  colors,
  Component,
  IComponent,
  IComponentConfig,
  Rect,
  utils,
  chroma,
  IComponentEventData,
} from '../core';
import {
  IStackedBarPositioner,
  IStackedBars,
  IStackedBarsPositionerConfig,
  StackedBarPositioner,
} from './stacked-bar-positioner';
import { renderBars } from './bars';
import { select, Selection, BaseType, create } from 'd3-selection';
import { Primitive } from 'd3-array';
import { ScaleBand, ScaleLinear } from 'd3-scale';
import { BarOrientation } from './bar-positioner';

export interface IStackedBarsComponentConfig
  extends IComponentConfig,
    IStackedBarsPositionerConfig {
  transitionDuration: number;
  events: utils.IDictionary<(event: Event, data: IStackedBarsEventData) => void>;
}

export interface IStackedBarsEventData extends IComponentEventData {
  categoryIndex: number;
  barIndex: number;
  rectElement: SVGRectElement;
  barElement: SVGGElement;
  barStackElement: SVGGElement;
}

export interface IStackedBarsComponent
  extends IComponent<IStackedBarsComponentConfig>,
    IStackedBars {}

export class StackedBarsComponent
  extends Component<IStackedBarsComponentConfig>
  implements IStackedBarsComponent {
  private _barPositioner: IStackedBarPositioner = new StackedBarPositioner();

  static defaultColors = colors.categorical;

  static setEventListeners(component: StackedBarsComponent, config: IStackedBarsComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        const rectElement = e.target as SVGRectElement;
        const barElement = rectElement.parentNode!;
        const barStackElement = barElement.parentNode!;

        const indexOf = Array.prototype.indexOf;
        const categoryIndex = indexOf.call(barStackElement.parentNode!.children, barStackElement);
        const barIndex = indexOf.call(barStackElement.children, barElement);

        config.events[typenames](e, {
          component: component,
          categoryIndex: categoryIndex,
          barIndex: barIndex,
          barStackElement: barStackElement as SVGGElement,
          barElement: barElement as SVGGElement,
          rectElement: rectElement,
        });
      });
    }
  }

  constructor() {
    super(
      create<SVGGElement>('svg:g').classed('stacked-bars', true),
      {
        categories: [],
        values: [],
        categoryPadding: 0.1,
        orientation: BarOrientation.Vertical,
        transitionDuration: 0,
        attributes: Object.assign(
          { '.bar': { stroke: '#232323', 'stroke-width': 3 } },
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
    this.render(false);
    return this;
  }

  render(animated: boolean): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout') || '0, 0, 600, 400');
    this._barPositioner.fitInSize(layoutRect);

    const values = this.activeConfig().values;
    const bars = this._barPositioner.bars();
    this.selection()
      .selectAll<SVGGElement, number[][]>('.bar-stack')
      .data(values)
      .join('g')
      .classed('bar-stack', true)
      .each((d, i, groups) => {
        const barsPerStack = bars.length / values.length;
        renderBars(
          select(groups[i]),
          bars.slice(i * barsPerStack, i * barsPerStack + barsPerStack),
          animated ? this.activeConfig().transitionDuration : 0
        );
      });

    this.selection().call(utils.applyAttributes, this.activeConfig().attributes);

    return this;
  }

  bars(): Rect[] {
    return this._barPositioner.bars();
  }

  categoriesScale(): ScaleBand<Primitive> {
    return this._barPositioner.categoriesScale();
  }

  valuesScale(): ScaleLinear<number, number> {
    return this._barPositioner.valuesScale();
  }
}

export function stackedBars(): StackedBarsComponent {
  return new StackedBarsComponent();
}
