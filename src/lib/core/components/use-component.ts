import { ChartComponent } from '../chart-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';

export class UseComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(LayoutTransformMixin(ChartComponent)))
) {
  constructor() {
    super('use');
  }
}

export function use(): UseComponent {
  return new UseComponent();
}
