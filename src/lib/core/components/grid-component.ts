import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';
import { GridMixin } from '../mixins/grid-mixin';

export class GridComponent extends GridMixin(ChildrenMixin(BaseComponent)) {
  constructor() {
    super('g');
  }
}

export function grid(): GridComponent {
  return new GridComponent();
}
