import { BaseComponent } from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class GaussianBlurComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(BaseComponent)
) {
  constructor() {
    super('feGaussianBlur');
  }
}

export function gaussianBlur(): GaussianBlurComponent {
  return new GaussianBlurComponent();
}
