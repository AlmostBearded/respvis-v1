import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { rectFromString, rectToString } from '../rect';

export class SVGComponent extends ChildrenMixin(BaseComponent) {
  constructor() {
    super('svg');
    this.layout('grid-template', '1fr / 1fr');
  }

  afterLayout(): this {
    super.afterLayout();
    const layout = rectFromString(this.attr('layout'));
    this.attr('viewBox', rectToString({ ...layout, x: 0, y: 0 }))
      .attr('x', layout.x)
      .attr('y', layout.y)
      .attr('width', layout.width)
      .attr('height', layout.height);

    return this;
  }
}

export function svg(): SVGComponent {
  return new SVGComponent();
}
