import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';

export class DefsComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(BaseComponent))
) {
  constructor() {
    super('defs');
  }
}

export function defs(): DefsComponent {
  return new DefsComponent();
}
