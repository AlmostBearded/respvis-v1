import { Selection, BaseType, create } from 'd3-selection';
import { Component, IComponent, IComponentConfig } from '../component';

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
      conditionalConfigs: [],
    });
  }

  _applyConfig(config: ITextConfig): void {
    this.selection().text(config.text);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    return this;
  }

  resize(): this {
    return this;
  }

  protected _afterResize(): void {}

  render(animated: boolean): this {
    return this;
  }

  renderOrder(): number {
    return 0;
  }
}

export function text(): Text {
  return new Text();
}
