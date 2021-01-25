import { BaseComponent, TextComponent, titleTextAttributes, verticalTextAttributes } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { LeftTicksComponent } from './left-ticks-component';

export class LeftAxisComponent extends ChildrenMixin(BaseComponent) {
  private _ticks: LeftTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');

    this.layout('grid-template', 'auto / auto auto').children([
      (this._ticks = new LeftTicksComponent().layout('grid-area', '1 / 2 / 2 / 3')),
      (this._title = verticalTextAttributes(
        titleTextAttributes(new TextComponent())
          .layout('grid-area', '1 / 1 / 2 / 2')
          .layout('place-self', 'center')
      )),
    ]);
  }

  ticks(): LeftTicksComponent {
    return this._ticks;
  }

  title(): TextComponent {
    return this._title;
  }
}

export function leftAxis(): LeftAxisComponent {
  return new LeftAxisComponent();
}
