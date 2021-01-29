import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';

export class DefsComponent extends ChildrenMixin(BaseComponent) {
  constructor() {
    super('defs');
  }
}

export function defs(): DefsComponent {
  return new DefsComponent();
}
