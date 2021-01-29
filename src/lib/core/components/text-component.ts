import { BaseComponent } from '../base-component';
import { StaticSizeMixin } from '../mixins/static-size-mixin';

export class TextComponent extends StaticSizeMixin(BaseComponent) {
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
