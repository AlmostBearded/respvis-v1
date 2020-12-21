import {
  Rect,
  colors,
  utils,
  Component,
  IComponent,
  IComponentConfig,
  IComponentEventData,
  setUniformNestedAttributes,
  IAttributes,
  setAttributes,
  clipByItself,
  transitionAttributes,
} from '../core';
import { Selection, BaseType, create } from 'd3-selection';
import {
  BarPositioner,
  DEFAULT_BAR_POSITIONER_CONFIG,
  IBarPositioner,
  IBarPositionerConfig,
  IBars,
} from './bar-positioner';

export interface IBarsComponentConfig extends IComponentConfig, IBarPositionerConfig {
  createBars: (
    selection: Selection<BaseType, IAttributes, any, unknown>
  ) => Selection<SVGRectElement, IAttributes, any, unknown>;
  transitionDuration: number;
  events: utils.IDictionary<(event: Event, data: IBarsEventData) => void>;
}

export interface IBarsComponent extends IComponent<IBarsComponentConfig>, IBars {}

export interface IBarsEventData extends IComponentEventData {
  index: number;
  barElement: SVGRectElement;
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
        ...DEFAULT_BAR_POSITIONER_CONFIG,
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
