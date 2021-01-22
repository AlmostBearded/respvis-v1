import { BaseComponent } from '../base-component';

export class RectComponent extends BaseComponent {
  constructor() {
    super('rect');
    this.layout('width', 'min-content').layout('height', 'min-content');
  }
}
