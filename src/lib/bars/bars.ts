import {
  Rect,
  renderClippedRect,
  colors,
  utils,
  Component,
  IComponent,
  IComponentConfig,
  chroma,
} from '../core';
import {
  BarPositioner,
  BarOrientation,
  IBarPositioner,
  IBars,
  IBarPositionerConfig,
} from './bar-positioner';
import { select, Selection, BaseType, create } from 'd3-selection';
import { ScaleBand, ScaleLinear } from 'd3-scale';
import { Primitive } from 'd3-array';
import 'd3-transition';

export interface IBarsComponentConfig extends IComponentConfig, IBarPositionerConfig {
  transitionDuration: number;
  events: { typenames: string; callback: (event: Event, data: IBarsEventData) => void }[];
}

export interface IBarsComponent extends IComponent<IBarsComponentConfig>, IBars {}

export interface IBarsEventData {
  index: number;
  rectElement: SVGRectElement;
  barElement: SVGGElement;
}

export class BarsComponent extends Component<IBarsComponentConfig> implements IBarsComponent {
  private _barPositioner: IBarPositioner = new BarPositioner();

  static defaultColor = colors.categorical[0];

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('bars', true),
      {
        categories: [],
        values: [],
        orientation: BarOrientation.Vertical,
        categoryPadding: 0.1,
        transitionDuration: 0,
        attributes: {
          '.bar > rect': {
            fill: BarsComponent.defaultColor,
            stroke: chroma.hex(BarsComponent.defaultColor).darken(2).hex(),
            'stroke-width': 4,
          },
        },
        conditionalConfigs: [],
        events: [],
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IBarsComponentConfig): void {
    this._barPositioner.config(config);
    // TODO: Set event handlers here.
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());

    this._barPositioner.fitInSize({ width: 600, height: 400 });
    this.render(false);

    return this;
  }

  resize(): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout'));
    this._barPositioner.fitInSize(layoutRect);
    return this;
  }

  protected _afterResize(): void {}

  render(animated: boolean): this {
    this.selection()
      .call(
        renderBars,
        this._barPositioner.bars(),
        animated ? this.activeConfig().transitionDuration : 0
      )
      .call(utils.applyAttributes, this.activeConfig().attributes);

    const barsSelection = this.selection().selectAll<SVGGElement, unknown>('.bar');
    this.activeConfig().events.forEach((eventConfig) =>
      barsSelection.on(eventConfig.typenames, function (e: Event) {
        const index = Array.prototype.indexOf.call(this.parentNode!.children, this);
        eventConfig.callback(e, {
          index: index,
          rectElement: e.target as SVGRectElement,
          barElement: this,
        });
      })
    );

    return this;
  }

  renderOrder(): number {
    return 0;
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

export function bars(): BarsComponent {
  return new BarsComponent();
}

export function renderBars(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  bars: Rect[],
  transitionDuration: number
): Selection<SVGGElement, Rect, SVGGElement, unknown> {
  return selection
    .selectAll<SVGGElement, Rect>('.bar')
    .data(bars)
    .join('g')
    .classed('bar', true)
    .each((d, i, nodes) => select(nodes[i]).call(renderClippedRect, { ...d }, transitionDuration));
}
