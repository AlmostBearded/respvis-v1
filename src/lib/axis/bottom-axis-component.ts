import { TextComponent, titleTextAttributes } from '../core';
import { AxisComponent } from './axis-component';
import { BottomTicksComponent } from './bottom-ticks-component';
import { TicksComponent } from './ticks-component';

export class BottomAxisComponent extends AxisComponent {
  constructor() {
    super();
    this.layout('grid-template', 'auto auto / auto');
  }

  protected _createTicks(): TicksComponent {
    return new BottomTicksComponent().layout('grid-area', '1 / 1 / 2 / 2');
  }

  protected _createTitle(): TextComponent {
    return titleTextAttributes(new TextComponent())
      .layout('grid-area', '2 / 1 / 3 / 2')
      .layout('place-self', 'center')
      .layout('margin-top', 5);
  }
}

export function bottomAxis(): BottomAxisComponent {
  return new BottomAxisComponent();
}
