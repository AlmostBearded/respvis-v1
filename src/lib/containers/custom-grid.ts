import { Component, IComponent } from '../component';
import { Selection, BaseType, select, create } from 'd3-selection';
import { ILayout, ILayoutElement } from '../layout/layout';
import { setSingleCellGridPosition } from './nine-patch';

export interface ICustomGrid extends IComponent {
  rows(style: string): this;
  rows(): string;
  columns(style: string): this;
  columns(): string;
  // inline(inline: boolean) : this;
  // inline(): boolean;
  child(row: number, column: number, child: IComponent | null): this;
  child(row: number, column: number): IComponent | undefined;
}

export class CustomGrid extends Component implements ICustomGrid {
  private _children: Map<[number, number], IComponent> = new Map();

  constructor() {
    super(create<SVGElement>('svg:g').classed('custom-grid', true));
    this.layout('display', 'grid')
      .layout('gridTemplateRows', 'auto')
      .layout('gridTemplateColumns', 'auto');
  }

  rows(style: string): this;
  rows(): string;
  rows(style?: string): any {
    if (style === undefined) return this.layout('gridTemplateRows');
    this.layout('gridTemplateRows', style);
    return this;
  }

  columns(style: string): this;
  columns(): string;
  columns(style?: string): any {
    if (style === undefined) return this.layout('gridTemplateColumns');
    this.layout('gridTemplateColumns', style);
    return this;
  }

  // inline(inline: boolean): this;
  // inline(): boolean;
  // inline(inline?: any) {
  //   throw new Error('Method not implemented.');
  // }

  child(row: number, column: number, child: IComponent | null): this;
  child(row: number, column: number): IComponent | undefined;
  child(row: number, column: number, child?: IComponent | null): any {
    if (child === undefined) return this._children.get([row, column]);
    if (child === null) this._children.delete([row, column]);
    else {
      this._children = new Map(
        [...this._children.set([row, column], child)].sort(
          (a, b) => a[1].renderOrder() - b[1].renderOrder()
        )
      );
      setSingleCellGridPosition(child, row, column);
    }
    return this;
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this._children.forEach((child) => child.mount(this.selection()));
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

  renderOrder(): number {
    // TODO: This should probably configurable by the user
    return 0;
  }
}

export function customGrid(): CustomGrid {
  return new CustomGrid();
}
