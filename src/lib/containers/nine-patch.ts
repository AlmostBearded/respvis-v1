import { IComponent, NULL_COMPONENT } from '../component';
import { Selection, BaseType } from 'd3-selection';
import { ILayout } from '../layout/layout';

export enum Row {
  Top = 1,
  Center = 2,
  Bottom = 3,
}

export enum Column {
  Left = 1,
  Center = 2,
  Right = 3,
}

export interface INinePatch extends IComponent {
  child(row: Row, column: Column, child: IComponent | null): this;
  child(row: Row, column: Column): IComponent | undefined;
}

export class NinePatch implements INinePatch {
  private _selection: Selection<SVGGElement, unknown, BaseType, unknown>;
  private _children: Map<[Row, Column], IComponent> = new Map();

  child(row: Row, column: Column, child: IComponent | null): this;
  child(row: Row, column: Column): IComponent | undefined;
  child(row: Row, column: Column, child?: IComponent | null): any {
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
      .classed('nine-patch', true)
      .style('display', 'grid')
      .style('grid-template-rows', 'auto 1fr auto')
      .style('grid-template-columns', 'auto 1fr auto');
    this._children.forEach((child, position) => {
      child
        .mount(this._selection)
        .selection()
        .call(setSingleCellGridPosition, position[0], position[1]);
    });

    return this;
  }
  fitInLayout(layout: ILayout): this {
    this._children.forEach((child) => child.fitInLayout(layout));
    return this;
  }
  render(transitionDuration: number): this {
    this._children.forEach((child, position) =>
      child.render(transitionDuration)
    );
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

export function ninePatch(): NinePatch {
  return new NinePatch();
}

// TODO: This function should better be moved into a grid-utils.ts file or something along those lines.
export function setSingleCellGridPosition(
  component: IComponent,
  row: number,
  column: number
) {
  component
    .layout('gridRowStart', row)
    .layout('gridRowEnd', row + 1)
    .layout('gridColumnStart', column)
    .layout('gridColumnEnd', column + 1);
}
