import { TextComponent, titleTextAttributes, verticalTextAttributes } from '../core';
import { AxisComponent } from './axis-component';
import { LeftTicksComponent } from './left-ticks-component';
import { TicksComponent } from './ticks-component';

export class LeftAxisComponent extends AxisComponent {
  constructor() {
    super();
    this.layout('grid-template', 'auto / auto auto');
  }

  protected _createTicks(): TicksComponent {
    return new LeftTicksComponent().layout('grid-area', '1 / 2 / 2 / 3');
  }

  protected _createTitle(): TextComponent {
    return verticalTextAttributes(
      titleTextAttributes(new TextComponent())
        .layout('grid-area', '1 / 1 / 2 / 2')
        .layout('place-self', 'center')
        .layout('margin-right', 5)
    );
  }
}

export function leftAxis(): LeftAxisComponent {
  return new LeftAxisComponent();
}
