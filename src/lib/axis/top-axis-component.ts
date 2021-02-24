import { BaseComponent, TextComponent, titleTextAttributes } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { AxisComponent } from './axis-component';
import { TopTicksComponent } from './top-ticks-component';

export class TopAxisComponent extends ChildrenMixin(BaseComponent) implements AxisComponent {
  private _ticks: TopTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');

    this.layout('grid-template', 'auto auto / auto')
      .child('ticks', (this._ticks = new TopTicksComponent().layout('grid-area', '2 / 1 / 3 / 2')))
      .child(
        'title',
        (this._title = titleTextAttributes(new TextComponent())
          .layout('grid-area', '1 / 1 / 2 / 2')
          .layout('place-self', 'center')
          .layout('margin-bottom', 5))
      );
  }

  ticks(): TopTicksComponent {
    return this._ticks;
  }

  title(): TextComponent {
    return this._title;
  }
}
