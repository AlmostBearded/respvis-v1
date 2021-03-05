import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';

export class GroupComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(BaseComponent))
) {
  constructor() {
    super('g');
    this.layout('grid-template', '1fr / 1fr');
  }
}

export function group(): GroupComponent {
  return new GroupComponent();
}
