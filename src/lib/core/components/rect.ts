import { Selection, BaseType, create, select } from 'd3-selection';
import { Component, IComponent, IComponentConfig } from '../component';
import { ISize } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { chainedTransition } from '../chained-transition';
import {
  IAttributes,
  setAttributes,
  setUniformNestedAttributes,
  transitionAttributes,
} from '../attributes';

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
          'stroke-width': 1,
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
      .datum(config.attributes)
      .call(setUniformNestedAttributes)
      .datum(null);
    return this;
  }

  render(animated: boolean): this {
    return this._render(this.activeConfig(), animated);
  }
}

export function rect(): RectComponent {
  return new RectComponent();
}

export function renderClippedRect(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  attributes: IAttributes,
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
            .call((s) => s.append('rect').datum(attributes).call(setAttributes))
        )

        .select('rect')
        .each((d, i, groups) => {
          select(groups[i]).datum(attributes);
          chainedTransition(groups[i]).duration(transitionDuration).call(transitionAttributes);
        })
    )
    .call((s: any) =>
      (s.selectChildren('rect') as Selection<SVGRectElement, IAttributes, BaseType, unknown>)
        .data([null])
        .join((enter) =>
          enter
            .append('rect')
            .call((rect) =>
              rect.attr('clip-path', `url(#${clipId})`).datum(attributes).call(setAttributes)
            )
        )
        .each((d, i, groups) => {
          select(groups[i]).datum(attributes);
          chainedTransition(groups[i]).duration(transitionDuration).call(transitionAttributes);
        })
    );
}
