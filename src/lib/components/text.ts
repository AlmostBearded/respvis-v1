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
        // TODO: The height returned by the bounding box of text elements is too high
        // (see https://stackoverflow.com/questions/26290134/is-it-possible-to-more-accurately-measure-svg-text-height)
        // Maybe it is possible to use a package suck as https://www.npmjs.com/package/font-measure
        // to accurately determine the size of text elements.
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

export const titleAttributes = {
  'letter-spacing': '0.5em',
  'font-weight': 'bold',
};

export const verticalTextAttributes = {
  transform: 'rotate(-90)',
  'dominant-baseline': 'hanging',
  'text-anchor': 'end',
};
