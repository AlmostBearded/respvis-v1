import { IComponent } from '../component';
import { Selection, BaseType, select } from 'd3-selection';
import { ILayout } from '../layout/layout';
import { setSingleCellGridPosition } from './nine-patch';

export interface IStack extends IComponent {
  children(components: IComponent[]): this;
  children(): IComponent[];
}

export class Stack implements IStack {
  private _selection: Selection<SVGGElement, unknown, BaseType, unknown>;
  private _children: IComponent[] = [];

  children(children: IComponent[]): this;
  children(): IComponent[];
  children(children?: IComponent[]): any {
    if (children === undefined) return this._children;
    this._children = children.sort((a, b) => a.renderOrder() - b.renderOrder());
    if (this._selection) {
      this._children.forEach((child) => {
        if (!child.selection())
          throw new Error(
            'Unhandled case! Currently all components have to be mounted at the same time.'
          );
        else child.selection().call(setSingleCellGridPosition, 1, 1);
      });
    }
    return this;
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection
      .append('g')
      .classed('stack', true)
      .style('display', 'grid')
      .style('grid-template-rows', '1fr')
      .style('grid-template-columns', '1fr');
    this._children.forEach((child) =>
      child.mount(this._selection).selection().call(setSingleCellGridPosition, 1, 1)
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

export function stack(): Stack {
  return new Stack();
}
