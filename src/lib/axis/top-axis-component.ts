import { TextComponent, titleTextAttributes } from '../core';
import { AxisComponent } from './axis-component';
import { TicksComponent } from './ticks-component';
import { TopTicksComponent } from './top-ticks-component';

export class TopAxisComponent extends AxisComponent {
  constructor() {
    super();
    this.layout('grid-template', 'auto auto / auto');
  }

  protected _createTicks(): TicksComponent {
    return new TopTicksComponent().layout('grid-area', '2 / 1 / 3 / 2');
  }

  protected _createTitle(): TextComponent {
    return titleTextAttributes(new TextComponent())
      .layout('grid-area', '1 / 1 / 2 / 2')
      .layout('place-self', 'center')
      .layout('margin-bottom', 5);
  }
}
