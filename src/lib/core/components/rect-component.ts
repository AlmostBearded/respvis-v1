import { ChartComponent } from '../chart-component';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';
import { StaticSizeMixin } from '../mixins/static-size-mixin';

export class RectComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(LayoutTransformMixin(StaticSizeMixin(ChartComponent)))
) {
  constructor() {
    super('rect');
    this.layout('width', 'min-content').layout('height', 'min-content');
  }
}

export function rect(): RectComponent {
  return new RectComponent();
}
