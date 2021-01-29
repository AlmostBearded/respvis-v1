import { BaseComponent } from '../core';

export class BlendComponent extends BaseComponent {
  constructor() {
    super('feBlend');
  }
}

export function blend(): BlendComponent {
  return new BlendComponent();
}
