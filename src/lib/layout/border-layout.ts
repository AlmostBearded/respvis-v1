import { IComponent, NULL_COMPONENT } from '../component';
import { Selection, BaseType } from 'd3-selection';
import { ILayout } from './layout';

export enum Row {
  Top = 2,
  Center = 3,
  Bottom = 4,
}

export enum Column {
  Left = 2,
  Center = 3,
  Right = 4,
}

export interface IBorderLayout extends IComponent {
  slot(row: Row, column: Column, component: IComponent | null): this;
  slot(row: Row, column: Column): IComponent | null;
}

export class BorderLayout implements IBorderLayout {
  private _selection: Selection<SVGGElement, unknown, BaseType, unknown>;
  private _slots: Map<[Row, Column], IComponent> = new Map();

  slot(row: Row, column: Column, component?: IComponent | null): any {
    // TODO: Handle setting/clearing of slots after mounting
    if (component === undefined) return this._slots.get([row, column]);
    if (component === null) {
      this._slots.delete([row, column]);
      return this;
    }
    this._slots.set([row, column], component);

    // Sort map by render order of components
    this._slots = new Map([...this._slots].sort((a, b) => a[1].renderOrder() - b[1].renderOrder()));

    return this;
  }
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection.append('g').classed('border-layout', true);
    this._slots.forEach((component, position) => {
      component
        .mount(this._selection)
        .selection()
        .style('grid-row-start', position[0])
        .style('grid-row-end', position[0] + 1)
        .style('grid-column-start', position[1])
        .style('grid-column-end', position[1] + 1);
    });

    return this;
  }
  fitInLayout(layout: ILayout): this {
    this._slots.forEach((component, position) => {
      component.fitInLayout(layout);
    });
    return this;
  }
  render(transitionDuration: number): this {
    this._slots.forEach((component, position) => {
      component.render(transitionDuration);
    });
    return this;
  }
  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
}

export function borderLayout(): BorderLayout {
  return new BorderLayout();
}
