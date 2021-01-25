import { BaseComponent, TextComponent, titleTextAttributes } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { BottomTicksComponent } from './bottom-ticks-component';

export class BottomAxisComponent extends ChildrenMixin(BaseComponent) {
  private _ticks: BottomTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');
    this.layout('grid-template', 'auto auto / auto').children([
      (this._ticks = new BottomTicksComponent().layout('grid-area', '1 / 1 / 2 / 2')),
      (this._title = titleTextAttributes(new TextComponent())
        .layout('grid-area', '2 / 1 / 3 / 2')
        .layout('place-self', 'center')),
    ]);
  }

  ticks(): BottomTicksComponent {
    return this._ticks;
  }

  title(): TextComponent {
    return this._title;
  }
}

export function bottomAxis(): BottomAxisComponent {
  return new BottomAxisComponent();
}
