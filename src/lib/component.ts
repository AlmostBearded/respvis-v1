import { Selection, BaseType, select } from 'd3-selection';
import { ILayout } from './layout/layout';

export interface IComponent {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  fitInLayout(layout: ILayout): this;
  render(transitionDuration: number): this;
  selection(): Selection<SVGElement, unknown, BaseType, unknown>;
  renderOrder(): number;
}

export class NullComponent implements IComponent {
  private _selection: Selection<SVGElement, unknown, BaseType, unknown>;
  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = select('');
    return this;
  }
  render(transitionDuration: number): this {
    return this;
  }
  fitInLayout(layout: ILayout): this {
    return this;
  }
  renderOrder(): number {
    return 0;
  }
}

export const NULL_COMPONENT = new NullComponent();
