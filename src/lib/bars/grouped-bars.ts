import { Component, IComponent, IComponentConfig } from '../component';
import { IGroupedBarPositioner, GroupedBarPositioner } from './grouped-bar-positioner';
import { BaseType, Selection, select, create } from 'd3-selection';
import { Orientation } from './bar-positioner';
import { renderBars } from './bars';
import { ScaleBand, ScaleLinear } from 'd3-scale';
import { Primitive } from 'd3-array';
import { Rect } from '../rect';
import { applyAttributes, deepExtend, ISize } from '../utils';
import { categorical as categoricalColors } from '../colors';
import chroma from 'chroma-js';
import { applyLayoutTransforms } from '../layout/layout';

export interface IGroupedBarsConfig extends IComponentConfig {
  categories: string[];
  values: number[][];
  colors: string[];
  orientation: Orientation;
  flipCategories: boolean;
  flipSubcategories: boolean;
  flipValues: boolean;
  categoryPadding: number;
  subcategoryPadding: number;
  transitionDuration: number;
}

export interface IGroupedBars extends IComponent<IGroupedBarsConfig>, IGroupedBarPositioner {}

export class GroupedBars extends Component<IGroupedBarsConfig> implements IGroupedBars {
  private _barPositioner: IGroupedBarPositioner = new GroupedBarPositioner();

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('bars', true),
      {
        categories: [],
        values: [],
        colors: categoricalColors,
        flipCategories: false,
        flipSubcategories: false,
        flipValues: false,
        orientation: Orientation.Vertical,
        categoryPadding: 0.1,
        subcategoryPadding: 0.1,
        transitionDuration: 0,
        attributes: {},
        conditionalConfigs: [],
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IGroupedBarsConfig): void {
    const subcategoryCount = config.values?.[0]?.length || 0;
    config.colors = config.colors.slice(0, subcategoryCount);

    deepExtend(
      config.attributes,
      ...config.colors.map((c, i) => ({
        [`.bar:nth-child(${i + 1}) > rect`]: {
          fill: c,
          stroke: chroma.hex(c).darken(2).hex(),
          'stroke-width': 4,
        },
      }))
    );

    this._barPositioner
      .categories(config.categories)
      .values(config.values)
      .flipCategories(config.flipCategories)
      .flipSubcategories(config.flipSubcategories)
      .flipValues(config.flipValues)
      .orientation(config.orientation)
      .categoryPadding(config.categoryPadding)
      .subcategoryPadding(config.categoryPadding);
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
    const values = this._barPositioner.values();
    const bars = this._barPositioner.bars();
    this.selection()
      .selectAll<SVGGElement, number[][]>('.bar-group')
      .data(values)
      .join('g')
      .classed('bar-group', true)
      .each((d, i, groups) => {
        const barsPerGroup = bars.length / values.length;
        renderBars(
          select(groups[i]),
          bars.slice(i * barsPerGroup, i * barsPerGroup + barsPerGroup),
          animated ? this.activeConfig().transitionDuration : 0
        );
      });

    this.selection().call(applyAttributes, this.activeConfig().attributes);

    return this;
  }

  renderOrder(): number {
    return 0;
  }

  // # GroupedBarPositioner
  categories(categories?: Primitive[]): any {
    if (categories === undefined) return this._barPositioner.categories();
    this._barPositioner.categories(categories);
    return this;
  }
  values(values?: number[][]): any {
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
  flipSubcategories(flip?: boolean | undefined): any {
    if (flip === undefined) return this._barPositioner.flipSubcategories();
    this._barPositioner.flipSubcategories(flip);
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
  subcategoryPadding(padding?: number | undefined): any {
    if (padding === undefined) return this._barPositioner.subcategoryPadding();
    this._barPositioner.subcategoryPadding(padding);
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
  subcategoriesScale(): ScaleBand<Primitive> {
    return this._barPositioner.subcategoriesScale();
  }
  valuesScale(): ScaleLinear<number, number> {
    return this._barPositioner.valuesScale();
  }
}

export function groupedBars(): GroupedBars {
  return new GroupedBars();
}
