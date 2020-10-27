import { Selection, BaseType, create } from 'd3-selection';
import { Component, IComponent, IComponentConfig } from '../component';
import { applyAttributes, Attributes, ISize, nullFunction } from '../utils';
import chroma from 'chroma-js';
import { v4 as uuidv4 } from 'uuid';
import { utils } from '..';

// TODO: Maybe this component should be called ClippedRect?

export interface IRectComponentConfig extends IComponentConfig {
  size: ISize;
}

export interface IRectComponent extends IComponent<IRectComponentConfig> {}

export class RectComponent extends Component<IRectComponentConfig> implements IRectComponent {
  constructor() {
    super(
      create<SVGElement>('svg:g'),
      {
        size: { width: 10, height: 10 },
        attributes: {
          fill: '#999999',
          stroke: '#232323',
          'stroke-width': 4,
        },
        conditionalConfigs: [],
        customConfigParser: nullFunction
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IRectComponentConfig): void {
    config.attributes.width = config.size.width;
    config.attributes.height = config.size.height;
    // TODO: Rerender if size changed?
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

export function rect(): RectComponent {
  return new RectComponent();
}

export function renderClippedRect(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  attributes: Attributes,
  transitionDuration: number
): void {
  let clipId: string;

  selection
    // Casting to disable type checking as the latest d3-selection types don't contain selectChildren yet.
    .call((s: any) =>
      (s.selectChildren('clipPath') as Selection<SVGClipPathElement, unknown, BaseType, unknown>)
        .data([null])
        .join((enter) =>
          enter
            .append('clipPath')
            .attr('id', (clipId = uuidv4()))
            .call((s) => s.append('rect').call(applyAttributes, attributes))
        )

        .select('rect')
        .transition()
        .duration(transitionDuration)
        .call(applyAttributes, attributes)
    )
    .call((s: any) =>
      (s.selectChildren('rect') as Selection<SVGRectElement, unknown, BaseType, unknown>)
        .data([null])
        .join((enter) =>
          enter
            .append('rect')
            .attr('clip-path', `url(#${clipId})`)
            .call(applyAttributes, attributes)
        )
        .transition()
        .duration(transitionDuration)
        .call(applyAttributes, attributes)
    );
}
