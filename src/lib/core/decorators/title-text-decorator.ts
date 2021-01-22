import { Component } from '../component';
import { ComponentDecorator } from '../component-decorator';

// todo: this might be better placed in some kind of utility module and not in the core module
export class TitleTextDecorator<T extends Component> extends ComponentDecorator<T> {
  constructor(component: T) {
    super(component);
    this.component().attr('letter-spacing', '0.5em').attr('font-weight', 'bold');
  }
}
