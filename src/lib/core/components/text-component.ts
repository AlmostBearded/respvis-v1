import { BaseComponent } from '../base-component';
import { ConfiguratorsMixin } from '../mixins/configurators-mixin';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';
import { MediaQueryConfiguratorsMixin } from '../mixins/media-query-configurators-mixin';
import { StaticSizeMixin } from '../mixins/static-size-mixin';
import { rectFromString } from '../rect';

export class TextComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(LayoutTransformMixin(StaticSizeMixin(BaseComponent)))
) {
  constructor() {
    super('text');
    this
      // auto-size grid cell to text bounding box
      .layout('width', 'min-content')
      .layout('height', 'min-content')

      // set origin to top-left corner
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')

      .attr('font-family', 'sans-serif');
  }
}

export function text(): TextComponent {
  return new TextComponent();
}
