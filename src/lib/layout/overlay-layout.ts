import { IComponent } from '../component';
import { Selection, BaseType, select } from 'd3-selection';
import { ILayout } from './layout';
import { setSingleCellGridPosition } from './border-layout';

export interface IOverlayLayout extends IComponent {
  slots(components: IComponent[]): this;
  slots(): IComponent[];
}

export class OverlayLayout implements IOverlayLayout {
  private _selection: Selection<SVGGElement, unknown, BaseType, unknown>;
  private _slots: IComponent[] = [];
  slots(components: IComponent[]): this;
  slots(): IComponent[];
  slots(components?: IComponent[]): any {
    if (components === undefined) return this._slots;
    this._slots = components.sort((a, b) => a.renderOrder() - b.renderOrder());
    if (this._selection) {
      for (let i = 0; i < this._slots.length; ++i) {
        this._slots[i].selection().call(setSingleCellGridPosition, 1, 1);
      }
    }
    return this;
  }
  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._selection = selection
      .append('g')
      .classed('overlay-layout', true)
      .style('display', 'grid')
      .style('grid-template-rows', '1fr')
      .style('grid-template-columns', '1fr');
    for (let i = 0; i < this._slots.length; ++i) {
      this._slots[i]
        .mount(this._selection)
        .selection()
        .call(setSingleCellGridPosition, 1, 1);
    }
    return this;
  }
  fitInLayout(layout: ILayout): this {
    for (let i = 0; i < this._slots.length; ++i) {
      this._slots[i].fitInLayout(layout);
    }
    return this;
  }
  render(transitionDuration: number): this {
    for (let i = 0; i < this._slots.length; ++i) {
      this._slots[i].render(transitionDuration);
    }
    return this;
  }
  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._selection;
  }
  renderOrder(): number {
    return 0;
  }
}

export function overlayLayout(): OverlayLayout {
  return new OverlayLayout();
}
