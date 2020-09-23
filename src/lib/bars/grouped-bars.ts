import { IComponent } from '../component';
import { IGroupedBarPositioner, GroupedBarPositioner } from './grouped-bar-positioner';
import { BaseType, Selection, select } from 'd3-selection';
import { Bar, Orientation } from './bar-positioner';
import { ILayout } from '../layout/layout';
import { renderBars } from './bars';
import { ScaleBand, ScaleLinear } from 'd3-scale';
import { Primitive } from 'd3-array';
import { Size } from '../utils';

export interface IGroupedBars extends IComponent, IGroupedBarPositioner {}

export class GroupedBars implements IGroupedBars {
  private _barPositioner: IGroupedBarPositioner = new GroupedBarPositioner();

  private _containerSelection: Selection<SVGGElement, unknown, BaseType, unknown>;

  constructor() {}

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._containerSelection = selection
      .selectAll<SVGGElement, unknown>('.bars')
      .data([null])
      .join('g')
      .classed('bars', true);

    var boundingRect = selection.node()!.getBoundingClientRect();
    this.fitInSize(boundingRect);
    this.render(0);

    return this;
  }

  fitInLayout(layout: ILayout): this {
    var layoutRect = layout.layoutOfElement(this._containerSelection.node()!)!;
    this.fitInSize(layoutRect);
    return this;
  }

  render(transitionDuration: number): this {
    const values = this._barPositioner.values();
    const bars = this._barPositioner.bars();
    this._containerSelection
      .selectAll<SVGGElement, number[][]>('.bar-group')
      .data(values)
      .join('g')
      .classed('bar-group', true)
      .each((d, i, groups) => {
        const barsPerGroup = bars.length / values.length;
        renderBars(
          select(groups[i]),
          bars.slice(i * barsPerGroup, i * barsPerGroup + barsPerGroup),
          transitionDuration
        );
      });

    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._containerSelection;
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
  fitInSize(size: Size): this {
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
