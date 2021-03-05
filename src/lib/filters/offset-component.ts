import { BaseComponent } from '../core';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export class OffsetComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(BaseComponent)
) {
  constructor() {
    super('feOffset');
  }
}

export function offset(): OffsetComponent {
  return new OffsetComponent();
}
