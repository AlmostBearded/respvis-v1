import { Selection, BaseType, create } from 'd3-selection';
import { Component, IComponent, IComponentConfig } from '../component';
import { applyAttributes, Attributes, ISize, nullFunction } from '../utils';
import chroma from 'chroma-js';
import { v4 as uuidv4 } from 'uuid';
import { utils } from '..';
import { chainedTransition } from '../chained-transition';

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
        responsiveConfigs: {},
        events: {},
        parseConfig: (previousConfig: IRectComponentConfig, newConfig: IRectComponentConfig) => {
          newConfig.attributes.width = newConfig.size.width;
          newConfig.attributes.height = newConfig.size.height;
        },
        applyConfig: (previousConfig: IRectComponentConfig, newConfig: IRectComponentConfig) => {
          Component.clearEventListeners(this, previousConfig);
          Component.setEventListeners(this, newConfig);
          this._render(newConfig, false);
        },
      },
      Component.mergeConfigs
    );
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this.render(false);
    return this;
  }

  resize(): this {
    return this;
  }

  private _render(config: IRectComponentConfig, animated: boolean): this {
    this.selection()
      .call(
        renderClippedRect,
        {
          x: 0,
          y: 0,
          ...config.size,
        },
        0
      )
      .call(applyAttributes, config.attributes);
    return this;
  }

  render(animated: boolean): this {
    return this._render(this.activeConfig(), animated);
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
        .each((d, i, groups) => {
          chainedTransition(groups[i])
            .duration(transitionDuration)
            .call(applyAttributes, attributes);
        })
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
        .each((d, i, groups) => {
          chainedTransition(groups[i])
            .duration(transitionDuration)
            .call(applyAttributes, attributes);
        })
    );
}
