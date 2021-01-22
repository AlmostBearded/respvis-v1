import {
  ComponentDecorator,
  GroupComponent,
  TextComponent,
  TitleTextDecorator,
  VerticalTextDecorator,
} from '../core';
import { ContainerComponent } from '../core/components/container-component';
import { RightTicksDecorator } from './right-ticks-decorator';

export class RightAxisDecorator extends ComponentDecorator<ContainerComponent> {
  private _ticks: RightTicksDecorator;
  private _title: VerticalTextDecorator<TitleTextDecorator<TextComponent>>;

  constructor(component: GroupComponent) {
    super(component);

    this.component()
      .layout('grid-template', 'auto / auto 5 auto')
      .children([
        (this._ticks = new RightTicksDecorator(new GroupComponent()).layout(
          'grid-area',
          '1 / 1 / 2 / 2'
        )),
        (this._title = new VerticalTextDecorator(new TitleTextDecorator(new TextComponent()))
          .layout('grid-area', '1 / 3 / 2 / 4')
          .layout('place-self', 'center')),
      ]);
  }

  ticks(): RightTicksDecorator {
    return this._ticks;
  }

  title(): VerticalTextDecorator<TitleTextDecorator<TextComponent>> {
    return this._title;
  }
}
