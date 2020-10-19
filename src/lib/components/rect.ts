import { Selection, BaseType, create } from 'd3-selection';
import { stringify } from 'uuid';
import { renderClippedRect } from '../bars/bars';
import { Component, IComponent, IComponentConfig } from '../component';
import { applyLayoutTransforms } from '../layout/layout';
import { applyAttributes, ISize } from '../utils';
import chroma from 'chroma-js';

// TODO: Maybe this component should be called ClippedRect?

export interface IRectConfig extends IComponentConfig {
  size: ISize;
  fill: string;
}

export interface IRect extends IComponent<IRectConfig> {}

export class Rect extends Component<IRectConfig> implements IRect {
  constructor() {
    super(
      create<SVGElement>('svg:g'),
      {
        size: { width: 10, height: 10 },
        fill: '#000000',
        attributes: {},
        conditionalConfigs: [],
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IRectConfig): void {
    config.attributes.width = config.size.width;
    config.attributes.height = config.size.height;
    this.selection().call(applyAttributes, config.attributes);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this.render(false);
    return this;
  }

  resize(): this {
    return this;
  }

  protected _afterResize(): void {}

  render(animated: boolean): this {
    this.selection()
      .call(
        renderClippedRect,
        {
          x: 0,
          y: 0,
          ...this.activeConfig().size,
          fill: this.activeConfig().fill,
          stroke: chroma.hex(this.activeConfig().fill).darken(2).hex(),
          'stroke-width': 4,
        },
        0
      )
      .call(applyAttributes, this.activeConfig().attributes);
    return this;
  }

  renderOrder(): number {
    return 0;
  }
}

export function rect(): Rect {
  return new Rect();
}
