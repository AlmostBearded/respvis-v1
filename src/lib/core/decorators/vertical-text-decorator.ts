import { Component } from '../component';
import { ComponentDecorator } from '../component-decorator';

// todo: this might be better placed in some kind of utility module and not in the core module
export class VerticalTextDecorator<T extends Component> extends ComponentDecorator<T> {
  constructor(component: T) {
    super(component);
    this.component()
      .attr('transform', 'rotate(-90)')
      .attr('dominant-baseline', 'hanging')
      .attr('text-anchor', 'end');
  }
}
