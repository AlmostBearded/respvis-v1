import { IComponent } from '../component';
import { Selection, BaseType, select } from 'd3-selection';
import { Primitive } from 'd3-array';
import { CustomGrid, ICustomGrid } from '../containers/custom-grid';
import { renderClippedRect } from '../bars/bars';
import { Text } from '../components/text';

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

interface ISquare extends IComponent {
  size(size: number): this;
  size(): number;
}

class Square implements ISquare, IAlignable {
  private _selection: Selection<ILayoutElement, unknown, BaseType, unknown>;
  private _size: number = 10;
  private _aligner: IAligner = new Aligner();

  size(size: number): this;
  size(): number;
  size(size?: number): any {
    if (size === undefined) return this._size;
    this._size = size;
    if (this._selection) {
      this.render(0);
    }
    return this;
  }

  alignSelf(alignment: Alignment): this {
    this._aligner.alignSelf(alignment);
    if (this._selection) {
      this._aligner.apply(this._selection);
    }
    return this;
  }

  justifySelf(alignment: Alignment): this {
    this._aligner.justifySelf(alignment);
    if (this._selection) {
      this._aligner.apply(this._selection);
    }
    return this;
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection.append('g');
    this._aligner.apply(this._selection);
    this.render(0);
    return this;
  }

  fitInLayout(layout: ILayouter): this {
    return this;
  }

  render(transitionDuration: number): this {
    this._selection.call(
      renderClippedRect,
      {
        x: 0,
        y: 0,
        width: this._size,
        height: this._size,
      },
      0
    );
    // TODO: This could potentially override other layoutStyle properties and could lead to nasty bugs.
    this._selection.node()!.layoutStyle = { width: this._size, height: this._size };
    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }

  renderOrder(): number {
    return 0;
  }
}

export interface IAligner extends IAlignable {
  apply(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
}

export class Aligner implements IAligner {
  private _alignSelf: Alignment;
  private _justifySelf: Alignment;

  alignSelf(alignment: Alignment): this {
    this._alignSelf = alignment;
    return this;
  }

  justifySelf(alignment: Alignment): this {
    this._justifySelf = alignment;
    return this;
  }

  apply(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.style('align-self', this._alignSelf).style('justify-self', this._justifySelf);
    return this;
  }
}
