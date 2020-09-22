import { IComponent } from '../component';
import { Selection, BaseType, select } from 'd3-selection';
import { ILayout, ILayoutElement } from '../layout/layout';
import { setSingleCellGridPosition } from './nine-patch';

export interface ICustomGrid extends IComponent {
  rows(style: string): this;
  rows(): string;
  columns(style: string): this;
  columns(): string;
  inline(inline: boolean) : this;
  inline(): boolean;
  child(row: number, column: number, child: IComponent | null): this;
  child(row: number, column: number): IComponent | undefined;
}

export class CustomGrid implements ICustomGrid {
  private _selection: Selection<ILayoutElement, unknown, BaseType, unknown>;
  private _rows: string = '1fr';
  private _columns: string = '1fr';
  private _children: Map<[number, number], IComponent> = new Map();

  rows(style: string): this;
  rows(): string;
  rows(style?: string): any {
    if (style === undefined) return this._rows;
    this._rows = style;
    return this;
  }

  columns(style: string): this;
  columns(): string;
  columns(style?: string): any {
    if (style === undefined) return this._columns;
    this._columns = style;
    return this;
  }
  
  inline(inline: boolean): this;
  inline(): boolean;
  inline(inline?: any) {
    throw new Error('Method not implemented.');
  }

  child(row: number, column: number, child: IComponent | null): this;
  child(row: number, column: number): IComponent | undefined;
  child(row: number, column: number, child?: IComponent | null): any {
    if (child === undefined) return this._children.get([row, column]);
    else if (child === null) this._children.delete([row, column]);
    else {
      this._children = new Map(
        [...this._children.set([row, column], child)].sort(
          (a, b) => a[1].renderOrder() - b[1].renderOrder()
        )
      );
      if (this._selection && !child.selection()) {
        throw new Error(
          'Unhandled case! Currently all components have to be mounted at the same time.'
        );
      }
      if (this._selection && child.selection()) {
        child.selection().call(setSingleCellGridPosition, row, column);
      }
    }
    return this;
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection
      .append('g')
      .classed('custom-grid', true)
      .style('display', 'grid')
      .style('grid-template-rows', this._rows)
      .style('grid-template-columns', this._columns);
    this._children.forEach((child, position) =>
      child
        .mount(this._selection)
        .selection()
        .call(setSingleCellGridPosition, position[0], position[1])
    );
    return this;
  }

  fitInLayout(layout: ILayout): this {
    this._children.forEach((child) => child.fitInLayout(layout));
    return this;
  }

  render(transitionDuration: number): this {
    this._children.forEach((child) => child.render(transitionDuration));
    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }

  renderOrder(): number {
    // TODO: This should probably configurable by the user
    return 0;
  }
}

export function customGrid(): CustomGrid {
  return new CustomGrid();
}
