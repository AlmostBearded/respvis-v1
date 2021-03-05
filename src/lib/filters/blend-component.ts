import { BaseComponent } from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class BlendComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(BaseComponent)
) {
  constructor() {
    super('feBlend');
  }
}

export function blend(): BlendComponent {
  return new BlendComponent();
}
