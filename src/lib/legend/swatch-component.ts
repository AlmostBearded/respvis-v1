import {
  BaseComponent,
  Component,
  LayoutTransformMixin,
  RectComponent,
  TextComponent,
} from '../core';
import { ChildrenMixin } from '../core/mixins/children-mixin';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class SwatchComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(LayoutTransformMixin(BaseComponent)))
) {
  private _rect: RectComponent;
  private _label: TextComponent;

  constructor() {
    super('g');
    this.layout('grid-template', `auto / auto auto`).layout('margin', 10);
    this.child(
      'rect',
      (this._rect = new RectComponent()
        .layout('grid-area', '1 / 1 / 2 / 2')
        .layout('place-self', 'center end')
        .attr('width', 15, 500)
        .attr('height', 15, 500))
    ).child(
      'label',
      (this._label = new TextComponent()
        .layout('grid-area', '1 / 2 / 2 / 3')
        .layout('place-self', 'center start')
        .layout('margin-left', 5))
    );
  }

  rect(): RectComponent {
    return this._rect;
  }

  label(): TextComponent {
    return this._label;
  }

  // adding further properties e.g. for rect color or label text would hurt parsimony
}

export function swatch(): SwatchComponent {
  return new SwatchComponent();
}
