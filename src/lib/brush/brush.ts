import { Selection, BaseType, create, selection } from 'd3-selection';
import { brush as d3Brush, BrushBehavior, D3BrushEvent } from 'd3-brush';
import {
  Component,
  IComponent,
  IComponentConfig,
  IComponentEventData,
  IRect,
  Rect,
  utils,
} from '../core';

export interface IBrushComponentConfig extends IComponentConfig {
  events: utils.IDictionary<(event: Event, data: IBrushEventData) => void>;
}

export interface IBrushEventData extends IComponentEventData {
  brushEvent: D3BrushEvent<unknown>;
  selectionRect?: IRect;
}

export interface IBrushComponent extends IComponent<IBrushComponentConfig> {}

export class BrushComponent extends Component<IBrushComponentConfig> implements IBrushComponent {
  private _brush: BrushBehavior<unknown>;

  static setEventListeners(component: BrushComponent, config: IBrushComponentConfig) {
    for (const typenames in config.events) {
      component._brush.on(typenames, (e: D3BrushEvent<unknown>) => {
        const s = e.selection;
        let selectionRect: IRect | undefined = undefined;
        if (s) {
          const x = s[0][0],
            y = s[0][1],
            width = s[1][0] - x,
            height = s[1][1] - y;
          selectionRect = { x: x, y: y, width: width, height: height };
        }
        config.events[typenames](e.sourceEvent, {
          component: component,
          brushEvent: e,
          selectionRect: selectionRect,
        });
      });
    }
  }

  static clearEventListeners(component: BrushComponent, config: IBrushComponentConfig) {
    for (const typenames in config.events) {
      component._brush.on(typenames, null);
    }
  }

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('brush', true),
      {
        attributes: {},
        events: {},
        responsiveConfigs: {},
        parseConfig: (
          previousConfig: IBrushComponentConfig,
          newConfig: IBrushComponentConfig
        ) => {},
        applyConfig: (previousConfig: IBrushComponentConfig, newConfig: IBrushComponentConfig) => {
          BrushComponent.clearEventListeners(this, previousConfig);
          BrushComponent.setEventListeners(this, newConfig);
        },
      },
      Component.mergeConfigs
    );
    this._brush = d3Brush();
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    return this;
  }

  render(animated: boolean): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout') || '0, 0, 600, 400');
    this._brush.extent([
      [0, 0],
      [layoutRect.width, layoutRect.height],
    ]);
    this.selection().call(this._brush);
    return this;
  }
}

export function brush(): BrushComponent {
  return new BrushComponent();
}
