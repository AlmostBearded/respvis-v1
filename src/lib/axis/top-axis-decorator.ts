import { ComponentDecorator, GroupComponent, TextComponent, TitleTextDecorator } from '../core';
import { ContainerComponent } from '../core/components/container-component';
import { TopTicksDecorator } from './top-ticks-decorator';

export class TopAxisDecorator extends ComponentDecorator<ContainerComponent> {
  private _ticks: TopTicksDecorator;
  private _title: TitleTextDecorator<TextComponent>;

  constructor(component: GroupComponent) {
    super(component);

    this.component()
      .layout('grid-template', 'auto 5 auto / auto')
      .children([
        (this._ticks = new TopTicksDecorator(new GroupComponent()).layout(
          'grid-area',
          '3 / 1 / 4 / 2'
        )),
        (this._title = new TitleTextDecorator(new TextComponent())
          .layout('grid-area', '1 / 1 / 2 / 2')
          .layout('place-self', 'center')),
      ]);
  }

  ticks(): TopTicksDecorator {
    return this._ticks;
  }

  title(): TitleTextDecorator<TextComponent> {
    return this._title;
  }
}
