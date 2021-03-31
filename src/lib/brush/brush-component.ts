import {
  D3BrushEvent,
  BrushBehavior,
  brush as d3Brush,
  brushSelection as d3BrushSelection,
} from 'd3-brush';
import {
  BaseComponent,
  Component,
  ComponentEventData,
  LayoutTransformMixin,
  Rect,
  rectFromString,
} from '../core';
import { arraysEqual } from '../core/array';
import { ConfiguratorsMixin } from '../core/mixins/configurators-mixin';
import { MediaQueryConfiguratorsMixin } from '../core/mixins/media-query-configurators-mixin';

export interface BrushEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  brushEvent: D3BrushEvent<any>;
  selectionRect: Rect<number> | undefined;
}

export class BrushComponent extends MediaQueryConfiguratorsMixin(
  ConfiguratorsMixin(LayoutTransformMixin(BaseComponent))
) {
  private _brush: BrushBehavior<any>;
  private _selectionRect: Rect<number> | undefined;

  constructor() {
    super('g');
    this._brush = d3Brush();
    this.classed('brush', true);
    // .attr('layout', '0, 0, 600, 400');
  }

  afterLayout(): this {
    // todo: unify duplicate code in render and transition methods?
    return this;
  }

  render(): this {
    super.render();

    console.assert(this.attr('layout') !== null, 'layout attribute must be specified');
    const layoutRect = rectFromString(this.attr('layout')!);

    this._brush.extent([
      [0, 0],
      [layoutRect.width, layoutRect.height],
    ]);

    this.selection().call(this._brush);

    const newBrushSelection = this._selectionRect
      ? [
          [this._selectionRect.x, this._selectionRect.y],
          [
            this._selectionRect.x + this._selectionRect.width,
            this._selectionRect.y + this._selectionRect.height,
          ],
        ]
      : null;

    const oldBrushSelection = d3BrushSelection(this.node() as SVGGElement);

    if (!arraysEqual(newBrushSelection, oldBrushSelection)) {
      // if (animated && config.transitionDuration > 0)
      //   this.selection()
      //     .transition()
      //     .duration(config.transitionDuration)
      //     .call(this._brush.move, newBrushSelection);
      // else this.selection().call(this._brush.move, newBrushSelection);
      this.selection().call(this._brush.move, newBrushSelection);
    }

    return this;
  }

  transition(): this {
    super.transition();

    console.assert(this.attr('layout') !== null, 'layout attribute must be specified');
    const layoutRect = rectFromString(this.attr('layout')!);

    this._brush.extent([
      [0, 0],
      [layoutRect.width, layoutRect.height],
    ]);

    this.selection().call(this._brush);

    const newBrushSelection = this._selectionRect
      ? [
          [this._selectionRect.x, this._selectionRect.y],
          [
            this._selectionRect.x + this._selectionRect.width,
            this._selectionRect.y + this._selectionRect.height,
          ],
        ]
      : null;

    const oldBrushSelection = d3BrushSelection(this.node() as SVGGElement);

    if (!arraysEqual(newBrushSelection, oldBrushSelection)) {
      // if (animated && config.transitionDuration > 0)
      //   this.selection()
      //     .transition()
      //     .duration(config.transitionDuration)
      //     .call(this._brush.move, newBrushSelection);
      // else this.selection().call(this._brush.move, newBrushSelection);
      this.selection().call(this._brush.move, newBrushSelection);
    }

    return this;
  }

  on(typenames: string, callback: null): this;
  on(typenames: string, callback: (event: Event, data: BrushEventData<this>) => void): this;
  on(typenames: any, callback: null | ((event: Event, data: BrushEventData<this>) => void)) {
    if (callback === null) this._brush.on(typenames, null);
    else {
      this._brush.on(typenames, (e: D3BrushEvent<unknown>) => {
        const s = e.selection;
        let selectionRect: Rect<number> | undefined;
        if (s) {
          const x = s[0][0],
            y = s[0][1],
            width = s[1][0] - x,
            height = s[1][1] - y;
          selectionRect = { x: x, y: y, width: width, height: height };
        }
        callback(e.sourceEvent, {
          component: this,
          brushEvent: e,
          selectionRect: selectionRect,
        });
      });
    }
    return this;
  }

  eventData(event: Event): ComponentEventData<this> | null {
    console.warn('cannot get event data of brush components');
    return null;
  }
}

export function brush(): BrushComponent {
  return new BrushComponent();
}

// export interface IBrushComponentConfig extends IComponentConfig {
//   selectionRect: IRect<number> | null;
//   transitionDuration: number;
//   events: utils.IDictionary<(event: Event, data: IBrushEventData) => void>;
// }

// export interface IBrushEventData extends IComponentEventData {
//   brushEvent: D3BrushEvent<unknown>;
//   selectionRect?: IRect<number>;
// }

// export interface IBrushComponent extends IComponent<IBrushComponentConfig> {}

// export class BrushComponent extends Component<IBrushComponentConfig> implements IBrushComponent {
//   private _brush: BrushBehavior<unknown>;

//   static setEventListeners(component: BrushComponent, config: IBrushComponentConfig) {
//     for (const typenames in config.events) {
//       component._brush.on(typenames, (e: D3BrushEvent<unknown>) => {
//         const s = e.selection;
//         let selectionRect: IRect<number> | undefined = undefined;
//         if (s) {
//           const x = s[0][0],
//             y = s[0][1],
//             width = s[1][0] - x,
//             height = s[1][1] - y;
//           selectionRect = { x: x, y: y, width: width, height: height };
//         }
//         config.events[typenames](e.sourceEvent, {
//           component: component,
//           brushEvent: e,
//           selectionRect: selectionRect,
//         });
//       });
//     }
//   }

//   static clearEventListeners(component: BrushComponent, config: IBrushComponentConfig) {
//     for (const typenames in config.events) {
//       component._brush.on(typenames, null);
//     }
//   }

//   constructor() {
//     super(
//       create<SVGElement>('svg:g').classed('brush', true),
//       {
//         selectionRect: null,
//         transitionDuration: 0,
//         attributes: {},
//         events: {},
//         responsiveConfigs: {},
//         parseConfig: (
//           previousConfig: IBrushComponentConfig,
//           newConfig: IBrushComponentConfig
//         ) => {},
//         applyConfig: (previousConfig: IBrushComponentConfig, newConfig: IBrushComponentConfig) => {
//           BrushComponent.clearEventListeners(this, previousConfig);
//           BrushComponent.setEventListeners(this, newConfig);
//         },
//       },
//       Component.mergeConfigs
//     );
//     this._brush = d3Brush();
//   }

//   mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
//     selection.append(() => this.selection().node());
//     return this;
//   }

//   render(animated: boolean): this {
//     const layoutRect = Rect.fromString(this.selection().attr('layout') || '0, 0, 600, 400');

//     const config = this.activeConfig();

//     this._brush.extent([
//       [0, 0],
//       [layoutRect.width, layoutRect.height],
//     ]);

//     this.selection().call(this._brush);

//     const r = config.selectionRect;
//     const newBrushSelection = r
//       ? [
//           [r.x, r.y],
//           [r.x + r.width, r.y + r.height],
//         ]
//       : null;

//     const oldBrushSelection = d3BrushSelection(this.selection().node() as SVGGElement);

//     if (!arraysEqual(newBrushSelection, oldBrushSelection)) {
//       if (animated && config.transitionDuration > 0)
//         this.selection()
//           .transition()
//           .duration(config.transitionDuration)
//           .call(this._brush.move, newBrushSelection);
//       else this.selection().call(this._brush.move, newBrushSelection);
//     }

//     return this;
//   }
// }

// export function brush(): BrushComponent {
//   return new BrushComponent();
// }
