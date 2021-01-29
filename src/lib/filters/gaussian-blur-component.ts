import { BaseComponent } from '../core';

export class GaussianBlurComponent extends BaseComponent {
  constructor() {
    super('feGaussianBlur');
  }
}

export function gaussianBlur(): GaussianBlurComponent {
  return new GaussianBlurComponent();
}
