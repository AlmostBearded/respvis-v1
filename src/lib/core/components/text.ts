import { BaseType, create, Selection } from 'd3-selection';
import { Component } from './component';

export class TextComponent extends Component {
  constructor();
  constructor(selection: Selection<SVGElement, any, any, any>);
  constructor(selection?: Selection<SVGElement, any, any, any>) {
    super(selection || create('svg:text'));
  }

  init(): this {
    super.init();
    return this.attr('width', 'min-content')
      .attr('height', 'min-content')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')
      .attr('font-family', 'sans-serif');
  }
}
