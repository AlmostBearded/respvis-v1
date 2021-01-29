import { BaseComponent } from '../core';

export class ColorMatrixComponent extends BaseComponent {
  constructor() {
    super('feColorMatrix');
  }
}

export function colorMatrix(): ColorMatrixComponent {
  return new ColorMatrixComponent();
}
