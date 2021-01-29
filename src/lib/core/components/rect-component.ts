import { BaseComponent } from '../base-component';
import { StaticSizeMixin } from '../mixins/static-size-mixin';

export class RectComponent extends StaticSizeMixin(BaseComponent) {
  constructor() {
    super('rect');
    this.layout('width', 'min-content').layout('height', 'min-content');
  }
}

export function rect(): RectComponent {
  return new RectComponent();
}
