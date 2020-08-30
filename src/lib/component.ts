import { Selection, BaseType } from 'd3-selection';
import { ILayout } from './layout/layout';

export interface IComponent {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this;
  fitInLayout(layout: ILayout): this;
  render(transitionDuration: number): this;
}

export class NullComponent implements IComponent {
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    return this;
  }
  render(transitionDuration: number): this {
    return this;
  }
  fitInLayout(layout: ILayout): this {
    return this;
  }
}
