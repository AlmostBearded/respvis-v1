import { TextComponent, titleTextAttributes, verticalTextAttributes } from '../core';
import { AxisComponent } from './axis-component';
import { RightTicksComponent } from './right-ticks-component';
import { TicksComponent } from './ticks-component';

export class RightAxisComponent extends AxisComponent {
  constructor() {
    super();
    this.layout('grid-template', 'auto / auto auto');
  }

  protected _createTicks(): TicksComponent {
    return new RightTicksComponent().layout('grid-area', '1 / 1 / 2 / 2');
  }

  protected _createTitle(): TextComponent {
    return verticalTextAttributes(titleTextAttributes(new TextComponent()))
      .layout('grid-area', '1 / 2 / 2 / 3')
      .layout('place-self', 'center')
      .layout('margin-left', 5);
  }
}

export function rightAxis(): RightAxisComponent {
  return new RightAxisComponent();
}
