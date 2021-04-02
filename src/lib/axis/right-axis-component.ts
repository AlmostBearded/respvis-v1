import {
  Component,
  LayoutTransformMixin,
  TextComponent,
  titleTextAttributes,
  verticalTextAttributes,
} from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';
import { AxisComponent } from './axis-component';
import { RightTicksComponent } from './right-ticks-component';

export class RightAxisComponent
  extends MediaQueryConfiguratorsMixin(
    ConfiguratorsMixin(ChildrenMixin(LayoutTransformMixin(Component)))
  )
  implements AxisComponent {
  private _ticks: RightTicksComponent;
  private _title: TextComponent;

  constructor() {
    super('g');

    this.layout('grid-template', 'auto / auto auto')
      .child(
        'ticks',
        (this._ticks = new RightTicksComponent().layout('grid-area', '1 / 1 / 2 / 2'))
      )
      .child(
        'title',
        (this._title = verticalTextAttributes(titleTextAttributes(new TextComponent()))
          .layout('grid-area', '1 / 2 / 2 / 3')
          .layout('place-self', 'center')
          .layout('margin-left', 5))
      );
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
