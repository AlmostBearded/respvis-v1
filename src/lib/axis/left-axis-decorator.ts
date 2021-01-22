import {
  ComponentDecorator,
  GroupComponent,
  TextComponent,
  TitleTextDecorator,
  VerticalTextDecorator,
} from '../core';
import { ContainerComponent } from '../core/components/container-component';
import { LeftTicksDecorator } from './left-ticks-decorator';

export class LeftAxisDecorator extends ComponentDecorator<ContainerComponent> {
  private _ticks: LeftTicksDecorator;
  private _title: VerticalTextDecorator<TitleTextDecorator<TextComponent>>;

  constructor(component: GroupComponent) {
    super(component);

    this.component()
      .layout('grid-template', 'auto / auto 5 auto')
      .children([
        (this._ticks = new LeftTicksDecorator(new GroupComponent()).layout(
          'grid-area',
          '1 / 3 / 2 / 4'
        )),
        (this._title = new VerticalTextDecorator(new TitleTextDecorator(new TextComponent()))
          .layout('grid-area', '1 / 1 / 2 / 2')
          .layout('place-self', 'center')),
      ]);
  }

  ticks(): LeftTicksDecorator {
    return this._ticks;
  }

  title(): VerticalTextDecorator<TitleTextDecorator<TextComponent>> {
    return this._title;
  }
}
