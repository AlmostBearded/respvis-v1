import { BaseComponent, TextComponent, titleTextAttributes } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { TopTicksComponent } from './top-ticks-component';

export class TopAxisComponent extends ChildrenMixin(BaseComponent) {
  private _ticks: TopTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('t');

    this.layout('grid-template', 'auto auto / auto').children([
      (this._ticks = new TopTicksComponent().layout('grid-area', '2 / 1 / 3 / 2')),
      (this._title = titleTextAttributes(new TextComponent())
        .layout('grid-area', '1 / 1 / 2 / 2')
        .layout('place-self', 'center')),
    ]);
  }

  ticks(): TopTicksComponent {
    return this._ticks;
  }

  title(): TextComponent {
    return this._title;
  }
}
