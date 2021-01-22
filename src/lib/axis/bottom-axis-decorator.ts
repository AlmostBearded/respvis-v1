import { ComponentDecorator, GroupComponent, TextComponent, TitleTextDecorator } from '../core';
import { ComponentExtension } from '../core/component-extension';
import { ContainerComponent } from '../core/components/container-component';
import { BottomTicksDecorator } from './bottom-ticks-decorator';

export class BottomAxisDecorator extends ComponentDecorator<ContainerComponent> {
  private _ticks: BottomTicksDecorator;
  private _title: TitleTextDecorator<TextComponent>;

  constructor(component: ContainerComponent) {
    super(component);
    this.component()
      .layout('grid-template', 'auto 5 auto / auto')
      .children([
        (this._ticks = new BottomTicksDecorator(new GroupComponent()).layout(
          'grid-area',
          '1 / 1 / 2 / 2'
        )),
        (this._title = new TitleTextDecorator(new TextComponent())
          .layout('grid-area', '3 / 1 / 4 / 2')
          .layout('place-self', 'center')),
      ]);
  }

  ticks(): BottomTicksDecorator {
    return this._ticks;
  }

  title(): TitleTextDecorator<TextComponent> {
    return this._title;
  }
}
