import { Component, IComponent, IComponentConfig } from '../component';
import { applyAttributes, Attributes, deepExtend, ISize } from '../utils';
import {
  BarPositioner,
  Orientation,
  IBarPositioner,
  IBars,
  IBarPositionerConfig,
} from './bar-positioner';
import { select, Selection, BaseType, create } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { Primitive } from 'd3-array';
import 'd3-transition';
import { v4 as uuidv4 } from 'uuid';
import { Transition } from 'd3-transition';
import { IRect, Rect } from '../rect';
import { categorical as categoricalColors } from '../colors';
import chroma from 'chroma-js';

export interface IBarsComponentConfig extends IComponentConfig, IBarPositionerConfig {
  color: string;
  colors: string[];
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

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('bars', true),
      {
        categories: [],
        values: [],
        color: categoricalColors[0],
        colors: [],
        flipCategories: false,
        flipValues: false,
        orientation: Orientation.Vertical,
        categoryPadding: 0.1,
        transitionDuration: 0,
        attributes: {},
        conditionalConfigs: [],
        events: [],
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IBarsComponentConfig): void {
    if (config.colors.length !== config.values.length) {
      config.colors = config.values.map(() => config.color);
    }
    this._barPositioner.config(config);
    this._applyBarColors();
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
    this.selection().call(
      renderBars,
      this._barPositioner.bars(),
      animated ? this.activeConfig().transitionDuration : 0
    );

    this._applyBarColors();

    this.selection().call(applyAttributes, this.activeConfig().attributes);

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

  private _applyBarColors(): void {
    this.selection()
      .selectAll<SVGRectElement, unknown>('.bar > rect')
      .each((d, i, nodes) => {
        select(nodes[i]).call(applyAttributes, {
          fill: this.activeConfig().colors[i],
          stroke: chroma.hex(this.activeConfig().colors[i]).darken(2).hex(),
          'stroke-width': 4,
        });
      });
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

export function renderClippedRect(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  attributes: Attributes,
  transitionDuration: number
): void {
  let clipId: string;

  selection
    // Casting to disable type checking as the latest d3-selection types don't contain selectChildren yet.
    .call((s: any) =>
      (s.selectChildren('clipPath') as Selection<SVGClipPathElement, unknown, BaseType, unknown>)
        .data([null])
        .join((enter) =>
          enter
            .append('clipPath')
            .attr('id', (clipId = uuidv4()))
            .call((s) => s.append('rect').call(applyAttributes, attributes))
        )

        .select('rect')
        .transition()
        .duration(transitionDuration)
        .call(applyAttributes, attributes)
    )
    .call((s: any) =>
      (s.selectChildren('rect') as Selection<SVGRectElement, unknown, BaseType, unknown>)
        .data([null])
        .join((enter) =>
          enter
            .append('rect')
            .attr('clip-path', `url(#${clipId})`)
            .call(applyAttributes, attributes)
        )
        .transition()
        .duration(transitionDuration)
        .call(applyAttributes, attributes)
    );
}
