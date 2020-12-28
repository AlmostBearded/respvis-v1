import {
  colors,
  Component,
  IComponent,
  IComponentConfig,
  Rect,
  utils,
  IComponentEventData,
  setUniformNestedAttributes,
  IAttributes,
  transitionBoundAttributes,
  setBoundAttributes,
} from '../core';
import { Selection, BaseType, create } from 'd3-selection';
import { createBars } from './bars';
import {
  IStackedBarPositioner,
  IStackedBarPositionerConfig,
  StackedBarPositioner,
  DEFAULT_STACKED_BAR_POSITIONER_CONFIG,
} from './stacked-bar-positioner';
import { IBars } from './bar-positioner';

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

export interface IStackedBarsComponent extends IComponent<IStackedBarsComponentConfig>, IBars {}

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
        ...DEFAULT_STACKED_BAR_POSITIONER_CONFIG,
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
      barsSelection
        .transition()
        .duration(config.transitionDuration)
        .call(transitionBoundAttributes);
    else barsSelection.call(setBoundAttributes);

    this.selection().call(setUniformNestedAttributes, this.activeConfig().attributes);

    return this;
  }

  bars(): Rect[] {
    return this._barPositioner.bars();
  }
}

export function stackedBars(): StackedBarsComponent {
  return new StackedBarsComponent();
}

export function createBarStacks(
  selection: Selection<BaseType, unknown, SVGElement, unknown>
): Selection<SVGGElement, unknown, SVGElement, unknown> {
  return selection.append('g').classed('bar-stack', true);
}
