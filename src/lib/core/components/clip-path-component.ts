import { ChartComponent } from '../chart-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';

export class ClipPathComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(ChildrenMixin(LayoutTransformMixin(ChartComponent)))
) {
  constructor() {
    super('clipPath');
  }
}

export function clipPath(): ClipPathComponent {
  return new ClipPathComponent();
}
