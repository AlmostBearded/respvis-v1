import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';

export class SVGComponent extends ChildrenMixin(BaseComponent) {
  constructor() {
    super('svg');
  }
}

export function svg(): SVGComponent {
  return new SVGComponent();
}
