import { ChartComponent } from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class BlendComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChartComponent)
) {
  constructor() {
    super('feBlend');
  }
}

export function blend(): BlendComponent {
  return new BlendComponent();
}
