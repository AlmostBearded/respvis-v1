import { BaseComponent, TextComponent, titleTextAttributes, verticalTextAttributes } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { RightTicksComponent } from './right-ticks-component';

export class RightAxisComponent extends ChildrenMixin(BaseComponent) {
  private _ticks: RightTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');

    this.layout('grid-template', 'auto / auto auto').children([
      (this._ticks = new RightTicksComponent().layout('grid-area', '1 / 1 / 2 / 2')),
      (this._title = verticalTextAttributes(titleTextAttributes(new TextComponent()))
        .layout('grid-area', '1 / 2 / 2 / 3')
        .layout('place-self', 'center')
        .layout('padding-left', 5)),
    ]);
  }

  ticks(): RightTicksComponent {
    return this._ticks;
  }

  title(): TextComponent {
    return this._title;
  }
}

export function rightAxis(): RightAxisComponent {
  return new RightAxisComponent();
}
