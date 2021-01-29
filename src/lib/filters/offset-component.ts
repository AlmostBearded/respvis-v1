import { BaseComponent } from '../core';

export class OffsetComponent extends BaseComponent {
  constructor() {
    super('feOffset');
  }
}

export function offset(): OffsetComponent {
  return new OffsetComponent();
}
