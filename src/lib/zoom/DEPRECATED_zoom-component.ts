import { D3ZoomEvent, zoom as d3Zoom, ZoomBehavior, ZoomScale, ZoomTransform } from 'd3-zoom';
import {
  Component,
  ComponentEventData,
  RectComponent,
  rectFromString,
  SVGComponent,
  uuid,
} from '../core';

export interface ZoomEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  zoomEvent: D3ZoomEvent<any, any>;
}

export class ZoomComponent extends SVGComponent {
  private _zoomBehavior: ZoomBehavior<any, any>;
  private _areaRect: RectComponent;
  private _translateExtentFactors: [[number, number], [number, number]];

  constructor() {
    super();

    this.attr('pointer-events', 'all').attr('layout', '0, 0, 600, 400');

    this._zoomBehavior = d3Zoom()
      .extent([
        [0, 0],
        [1, 1],
      ])
      .scaleExtent([1, 20]);

    this._translateExtentFactors = [
      [0, 0],
      [1, 1],
    ];

    this.child(
      'rect',
      (this._areaRect = new RectComponent())
        .attr('id', uuid())
        .layout('width', '100%')
        .layout('height', '100%')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('opacity', 0)
    );

    this.selection().call(this._zoomBehavior);
  }

  zoomBehavior(): ZoomBehavior<any, any> {
    return this._zoomBehavior;
  }

  scaleExtent(): [number, number];
  scaleExtent(extent: [number, number]): this;
  scaleExtent(extent?: [number, number]): [number, number] | this {
    if (extent === undefined) return this._zoomBehavior.scaleExtent();
    this._zoomBehavior.scaleExtent(extent);
    return this;
  }

  translateExtentFactors(): [[number, number], [number, number]];
  translateExtentFactors(extent: [[number, number], [number, number]]): this;
  translateExtentFactors(
    extent?: [[number, number], [number, number]]
  ): [[number, number], [number, number]] | this {
    if (extent === undefined) return this._translateExtentFactors;
    this._translateExtentFactors = extent;
    return this;
  }

  areaRect(): RectComponent {
    return this._areaRect;
  }

  // todo: add further missing methods

  afterLayout(): this {
    super.afterLayout();
    console.assert(this.attr('layout') !== null, 'layout attribute must be specified');
    const layout = rectFromString(this.attr('layout')!);
    this._zoomBehavior
      .extent([
        [0, 0],
        [layout.width, layout.height],
      ])
      .translateExtent([
        [
          this._translateExtentFactors[0][0] * layout.width,
          this._translateExtentFactors[0][1] * layout.height,
        ],
        [
          this._translateExtentFactors[1][0] * layout.width,
          this._translateExtentFactors[1][1] * layout.height,
        ],
      ]);

    return this;
  }

  on(typenames: string, callback: null): this;
  on(typenames: string, callback: (event: Event, data: ZoomEventData<this>) => void): this;
  on(typenames: any, callback: ((event: Event, data: ZoomEventData<this>) => void) | null) {
    if (callback === null) this._zoomBehavior.on(typenames, null);
    else
      this._zoomBehavior.on(typenames, (event: D3ZoomEvent<any, any>) => {
        callback(event.sourceEvent, { component: this, zoomEvent: event });
      });
    return this;
  }

  eventData(event: Event): null {
    console.warn('cannot get event data of zoom components');
    return null;
  }
}

export function zoom(): ZoomComponent {
  return new ZoomComponent();
}

export function rescaleX(
  transform: ZoomTransform,
  scale: ZoomScale,
  fullDomain: number[] | Date[]
): void {
  const zoomedScale = transform.rescaleX(scale.domain(fullDomain));
  scale.domain(zoomedScale.domain()).range(zoomedScale.range());
}

export function rescaleY(
  transform: ZoomTransform,
  scale: ZoomScale,
  fullDomain: number[] | Date[]
): void {
  const zoomedScale = transform.rescaleY(scale.domain(fullDomain));
  scale.domain(zoomedScale.domain()).range(zoomedScale.range());
}
