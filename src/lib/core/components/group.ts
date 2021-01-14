import { create, Selection } from 'd3-selection';
import { ContainerComponent } from './container';

export class GroupComponent extends ContainerComponent {
  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:g'));
  }
}
