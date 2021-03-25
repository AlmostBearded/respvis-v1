import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';

// todo: needs the static clone mixin?
//   probably better not to because it would clone the whole subtree 🤔
export class GroupComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(LayoutTransformMixin(BaseComponent)))
) {
  constructor() {
    super('g');
    this.layout('grid-template', '1fr / 1fr');
  }
}

export function group(): GroupComponent {
  return new GroupComponent();
}
