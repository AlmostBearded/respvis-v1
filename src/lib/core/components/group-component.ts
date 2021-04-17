import { BaseChartCompositeComponent } from '../chart-component';
import { LayoutTransformMixin } from '../mixins/layout-transform-mixin';

// todo: needs the static clone mixin?
//   probably better not to because it would clone the whole subtree 🤔
export class GroupComponent extends LayoutTransformMixin(BaseChartCompositeComponent) {
  constructor() {
    super('g');
    this.layout('grid-template', '1fr / 1fr');
  }
}

export function group(): GroupComponent {
  return new GroupComponent();
}
