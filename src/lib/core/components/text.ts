import { Selection, BaseType, create } from 'd3-selection';
import { Component, IComponent, IComponentConfig } from '../component';
import { nullFunction } from '../utils';

export interface ITextComponentConfig extends IComponentConfig {
  text: string;
}

export interface ITextComponent extends IComponent<ITextComponentConfig> {}

export class TextComponent extends Component<ITextComponentConfig> implements ITextComponent {
  constructor() {
    super(
      create<SVGElement>('svg:text'),
      {
        text: '',
        attributes: {
          width: 'min-content',
          // TODO: The height returned by the bounding box of text elements
          // is too high (see [1]). Maybe it is possible to use a package
          // such as [2] to accurately determine the size of text elements.
          // [1] https://stackoverflow.com/questions/26290134/is-it-possible-to-more-accurately-measure-svg-text-height
          // [2] https://www.npmjs.com/package/font-measure
          height: 'min-content',
          'dominant-baseline': 'hanging',
          'text-anchor': 'start',
          'font-family': 'sans-serif',
        },
        conditionalConfigs: [],
        events: [],
        configParser: (
          previousConfig: ITextComponentConfig,
          newConfig: ITextComponentConfig
        ) => {
          Component.clearEventListeners(this, previousConfig);
          Component.setEventListeners(this, newConfig);
          this.selection().text(newConfig.text);
        },
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
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

export function text(): TextComponent {
  return new TextComponent();
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
