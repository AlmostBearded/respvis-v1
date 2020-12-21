import {
  Component,
  IComponent,
  IComponentConfig,
  utils,
  colors,
  Rect,
  IComponentEventData,
  setUniformNestedAttributes,
  IAttributes,
  transitionAttributes,
  setAttributes,
} from '../core';
import { BaseType, Selection, create } from 'd3-selection';
import { createBars } from './bars';
import {
  DEFAULT_GROUPED_BAR_POSITIONER_CONFIG,
  GroupedBarPositioner,
  IGroupedBarPositioner,
  IGroupedBarPositionerConfig,
} from './grouped-bar-positioner';
import { IBars } from './bar-positioner';

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

export interface IGroupedBarsComponent extends IComponent<IGroupedBarsComponentConfig>, IBars {}

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
        ...DEFAULT_GROUPED_BAR_POSITIONER_CONFIG,
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

export function groupedBars(): GroupedBarsComponent {
  return new GroupedBarsComponent();
}

export function createBarGroups(
  selection: Selection<BaseType, unknown, SVGElement, unknown>
): Selection<SVGGElement, unknown, SVGElement, unknown> {
  return selection.append('g').classed('bar-group', true);
}
