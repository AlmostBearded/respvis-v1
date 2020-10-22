import { IComponent, IComponentConfig } from '../component';
import { Selection, BaseType, select } from 'd3-selection';
import { Primitive } from 'd3-array';
import { renderClippedRect } from '../components/bars/bars';
import { Text } from '../components/text';
import { IStringable } from '../utils';

export interface ILegendConfig extends IComponentConfig {
  categories: IStringable[],
  
}


export interface ILegend extends IComponent {
  categories(categories: Primitive[]): this;
  categories(): Primitive[];
  rows(rows: number): this;
  rows(): number;
  columns(columns: number): this;
  columns(): number;
}

export class Legend implements ILegend {
  private _categories: Primitive[] = [];
  private _rows: number = 0;
  private _columns: number = 0;
  private _customGrid: ICustomGrid = new CustomGrid();

  categories(categories: Primitive[]): this;
  categories(): Primitive[];
  categories(categories?: Primitive[]): any {
    if (categories === undefined) return this._categories;
    this._categories = categories;
    // TODO: Handle category changes after mount
    if (this._customGrid.selection()) {
      throw new Error('Unhandled case');
    }
    return this;
  }

  rows(rows: number): this;
  rows(): number;
  rows(rows?: number): any {
    if (rows === undefined) return this._rows;
    this._rows = rows;
    this._customGrid.rows(Array(rows).fill('auto').join(' '));
    return this;
  }

  columns(columns: number): this;
  columns(): number;
  columns(columns?: number): any {
    if (columns === undefined) return this._columns;
    this._columns = columns;
    this._customGrid.columns(Array(columns).fill('auto').join(' '));
    return this;
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    const swatches: IComponent[] = [];
    for (let row = 1; row <= this._rows; ++row) {
      for (let column = 1; column <= this._columns; ++column) {
        const categoryIndex = (row - 1) * this._columns + (column - 1);
        if (categoryIndex >= this._categories.length) break;

        const swatch = new CustomGrid()
          .rows('auto')
          .columns('5px auto 5px auto 5px')
          .child(1, 2, new Square().size(15).alignSelf(Alignment.Center).justifySelf(Alignment.End))
          .child(
            1,
            4,
            new Text()
              .text(this._categories[categoryIndex].toString())
              .alignSelf(Alignment.Center)
              .justifySelf(Alignment.Start)
          );

        swatches.push(swatch);

        this._customGrid.child(row, column, swatch);
      }
    }

    this._customGrid.mount(selection).selection().classed('legend', true);

    swatches.forEach((swatch) => swatch.selection().classed('swatch', true));

    return this;
  }

  fitInLayout(layout: ILayouter): this {
    this._customGrid.fitInLayout(layout);
    return this;
  }

  render(transitionDuration: number): this {
    this._customGrid.render(transitionDuration);
    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._customGrid.selection();
  }

  renderOrder(): number {
    return 0;
  }
}

export function legend(): Legend {
  return new Legend();
}