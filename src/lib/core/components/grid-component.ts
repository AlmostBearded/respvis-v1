import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { GridMixin } from '../mixins/grid-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';

export class GridComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(GridMixin(ChildrenMixin(BaseComponent)))
) {
  constructor() {
    super('g');
  }
}

export function grid(): GridComponent {
  return new GridComponent();
}
