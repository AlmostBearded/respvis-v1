import { Selection, BaseType, create } from 'd3-selection';
import { Component, IComponent, IComponentConfig } from '../component';
import { ILayout, ILayoutStyle } from '../layout/layout';

export interface ITextConfig extends IComponentConfig {
  text: string;
}

export interface IText extends IComponent<ITextConfig> {}

export class Text extends Component<ITextConfig> implements IText {
  constructor() {
    super(create<SVGElement>('svg:text'), {
      text: '',
      attributes: {
        width: 'min-content',
        height: 'min-content',
        'dominant-baseline': 'hanging',
        'text-anchor': 'start',
      },
      responsiveConfigs: [],
    });
  }

  _applyConfig(config: ITextConfig): void {
    this.selection().text(config.text);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    return this;
  }

  fitInLayout(layout: ILayout): this {
    return this;
  }

  render(transitionDuration: number): this {
    return this;
  }

  renderOrder(): number {
    return 0;
  }
}

export function text(): Text {
  return new Text();
}
