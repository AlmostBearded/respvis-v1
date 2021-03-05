import { BaseComponent, TextComponent, titleTextAttributes } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';
import { AxisComponent } from './axis-component';
import { BottomTicksComponent } from './bottom-ticks-component';

export class BottomAxisComponent
  extends MediaQueryConfiguratorsMixin(ConfiguratorsMixin(ChildrenMixin(BaseComponent)))
  implements AxisComponent {
  private _ticks: BottomTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');
    this.layout('grid-template', 'auto auto / auto')
      .child(
        'ticks',
        (this._ticks = new BottomTicksComponent().layout('grid-area', '1 / 1 / 2 / 2'))
      )
      .child(
        'title',
        (this._title = titleTextAttributes(new TextComponent())
          .layout('grid-area', '2 / 1 / 3 / 2')
          .layout('place-self', 'center')
          .layout('margin-top', 5))
      );
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
