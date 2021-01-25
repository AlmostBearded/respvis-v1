import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';

export class GroupComponent extends ChildrenMixin(BaseComponent) {
  constructor() {
    super('g');
  }
}

export function group(): GroupComponent {
  return new GroupComponent();
}
