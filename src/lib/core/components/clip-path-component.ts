import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';

export class ClipPathComponent extends MediaQueryConfiguratorsMixin(ConfiguratorsMixin(ChildrenMixin(BaseComponent))) {
  constructor() {
    super('clipPath');
  }
}

export function clipPath(): ClipPathComponent {
  return new ClipPathComponent();
}
