import { BaseComponent } from '../base-component';
import { ChildrenMixin } from '../mixins/children-mixin';

export class ClipPathComponent extends ChildrenMixin(BaseComponent) {
  constructor() {
    super('clipPath');
  }
}

export function clipPath(): ClipPathComponent {
  return new ClipPathComponent();
}
