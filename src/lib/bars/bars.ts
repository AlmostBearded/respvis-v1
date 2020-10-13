import { Component, IComponent, IComponentConfig } from '../component';
import { applyAttributes, Attributes, ISize } from '../utils';
import { Bar, BarPositioner, Orientation, IBarPositioner } from './bar-positioner';
import { select, Selection, BaseType, create } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { Primitive } from 'd3-array';
import 'd3-transition';
import { v4 as uuidv4 } from 'uuid';
import { Transition } from 'd3-transition';
import { IRect, Rect } from '../rect';
import { categorical as categoricalColors } from '../colors';
import chroma from 'chroma-js';

export interface IBarsConfig extends IComponentConfig {
  categories: string[];
  values: number[];
  color: string;
  orientation: Orientation;
  flipCategories: boolean;
  flipValues: boolean;
  categoryPadding: number;
  transitionDuration: number;
}

export interface IBars extends IComponent<IBarsConfig>, IBarPositioner {}

export class Bars extends Component<IBarsConfig> implements IBars {
  private _barPositioner: IBarPositioner = new BarPositioner();

  constructor() {
    super(create<SVGElement>('svg:g').classed('bars', true), {
      categories: [],
      values: [],
      color: categoricalColors[0],
      flipCategories: false,
      flipValues: false,
      orientation: Orientation.Vertical,
      categoryPadding: 0.1,
      transitionDuration: 0,
      attributes: {},
      conditionalConfigs: [],
    });
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IBarsConfig): void {
    this._barPositioner
      .categories(config.categories)
      .values(config.values)
      .flipCategories(config.flipCategories)
      .flipValues(config.flipValues)
      .orientation(config.orientation)
      .categoryPadding(config.categoryPadding);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());

    // var boundingRect = selection.node()!.getBoundingClientRect();
    // this.fitInSize(boundingRect);
    this.fitInSize({ width: 600, height: 400 });
    this.render(false);

    return this;
  }

  resize(): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout'));
    this.fitInSize(layoutRect);
    return this;
  }

  protected _afterResize(): void {}

  render(animated: boolean): this {
    this.selection().call(
      renderBars,
      this._barPositioner.bars(),
      this.activeConfig().values.map(() => ({
        fill: this.activeConfig().color,
        stroke: chroma.hex(this.activeConfig().color).darken(2).hex(),
        'stroke-width': 4,
      })),
      animated ? this.activeConfig().transitionDuration : 0
    );
    return this;
  }

  renderOrder(): number {
    return 0;
  }

  // # BarPositioner
  categories(categories?: Primitive[]): any {
    if (categories === undefined) return this._barPositioner.categories();
    this._barPositioner.categories(categories);
    return this;
  }
  values(values?: number[]): any {
    if (values === undefined) return this._barPositioner.values();
    this._barPositioner.values(values);
    return this;
  }
  orientation(orientation?: Orientation): any {
    if (orientation === undefined) return this._barPositioner.orientation();
    this._barPositioner.orientation(orientation);
    return this;
  }
  flipCategories(flip?: boolean): any {
    if (flip === undefined) return this._barPositioner.flipCategories();
    this._barPositioner.flipCategories(flip);
    return this;
  }
  flipValues(flip?: boolean): any {
    if (flip === undefined) return this._barPositioner.flipValues();
    this._barPositioner.flipValues(flip);
    return this;
  }
  categoryPadding(padding?: number): any {
    if (padding === undefined) return this._barPositioner.categoryPadding();
    this._barPositioner.categoryPadding(padding);
    return this;
  }
  fitInSize(size: ISize): this {
    this._barPositioner.fitInSize(size);
    return this;
  }
  bars(): Bar[] {
    return this._barPositioner.bars();
  }
  categoriesScale(): ScaleBand<Primitive> {
    return this._barPositioner.categoriesScale();
  }
  valuesScale(): ScaleLinear<number, number> {
    return this._barPositioner.valuesScale();
  }
}

export function bars(): Bars {
  return new Bars();
}

export function renderBars(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  bars: Bar[],
  attributes: Attributes[],
  transitionDuration: number
): Selection<SVGGElement, Bar, SVGGElement, unknown> {
  return selection
    .selectAll<SVGGElement, Bar>('.bar')
    .data(bars)
    .join('g')
    .classed('bar', true)
    .each((d, i, nodes) =>
      select(nodes[i]).call(renderClippedRect, { ...attributes[i], ...d }, transitionDuration)
    );
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
