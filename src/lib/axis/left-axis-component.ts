import { BaseComponent, TextComponent, titleTextAttributes, verticalTextAttributes } from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';
import { AxisComponent } from './axis-component';
import { LeftTicksComponent } from './left-ticks-component';

export class LeftAxisComponent
  extends MediaQueryConfiguratorsMixin(ConfiguratorsMixin(ChildrenMixin(BaseComponent)))
  implements AxisComponent {
  private _ticks: LeftTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');

    this.layout('grid-template', 'auto / auto auto')
      .child('ticks', (this._ticks = new LeftTicksComponent().layout('grid-area', '1 / 2 / 2 / 3')))
      .child(
        'title',
        (this._title = verticalTextAttributes(
          titleTextAttributes(new TextComponent())
            .layout('grid-area', '1 / 1 / 2 / 2')
            .layout('place-self', 'center')
            .layout('margin-right', 5)
        ))
      );
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
