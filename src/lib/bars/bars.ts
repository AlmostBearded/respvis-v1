import { Component, IComponent, IComponentConfig } from '../component';
import { Size } from '../utils';
import { ILayout } from '../layout/layout';
import { Bar, BarPositioner, Orientation, IBarPositioner } from './bar-positioner';
import { select, Selection, BaseType, create } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { max, merge, Primitive } from 'd3-array';
import 'd3-transition';
import { v4 as uuidv4 } from 'uuid';

export interface IBarsConfig extends IComponentConfig {
  categories: string[];
  values: number[];
  orientation: Orientation;
  flipCategories: boolean;
  flipValues: boolean;
  categoryPadding: number;
}

export interface IBars extends IComponent<IBarsConfig>, IBarPositioner {
  // on(
  //   eventType: string,
  //   listener:
  //     | ((evnt: Event, barElement: SVGElement, index: number) => void)
  //     | null
  // ): Bars;
}

export class Bars extends Component<IBarsConfig> implements IBars {
  private _barPositioner: IBarPositioner = new BarPositioner();

  // private _eventListeners = new Map<
  //   string,
  //   (evnt: Event, barElement: SVGRectElement, index: number) => void
  // >();

  // private _on = (
  //   eventType: string,
  //   listener:
  //     | ((evnt: Event, barElement: SVGRectElement, index: number) => void)
  //     | null
  // ): void => {};

  constructor() {
    super(create<SVGElement>('svg:g').classed('bars', true), {
      categories: [],
      values: [],
      flipCategories: false,
      flipValues: false,
      orientation: Orientation.Vertical,
      categoryPadding: 0.1,
      attributes: {},
      responsiveConfigs: [],
    });
  }

  protected _applyConfig(config: IBarsConfig): void {
    this._barPositioner
      .categories(this._activeConfig.categories)
      .values(this._activeConfig.values)
      .flipCategories(this._activeConfig.flipCategories)
      .flipValues(this._activeConfig.flipValues)
      .orientation(this._activeConfig.orientation)
      .categoryPadding(this._activeConfig.categoryPadding);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    //   _on = function (
    //     eventType: string,
    //     listener:
    //       | ((evnt: Event, barElement: SVGRectElement, index: number) => void)
    //       | null
    //   ): void {
    //     if (!listener) {
    //       _barsContainerSelection.on(eventType, null);
    //     } else {
    //       _barsContainerSelection.on(eventType, function (e: Event) {
    //         const barElement: SVGRectElement = e.target as SVGRectElement;
    //         const index = Array.prototype.indexOf.call(
    //           barElement.parentNode!.children,
    //           e.target
    //         );

    //         listener(e, barElement, index);
    //       });
    //     }
    //   };

    selection.append(() => this.selection().node());

    // var boundingRect = selection.node()!.getBoundingClientRect();
    // this.fitInSize(boundingRect);
    this.fitInSize({ width: 600, height: 400 });
    this.render(0);

    //   console.log(_eventListeners);
    //   _eventListeners.forEach((listener, eventType) => {
    //     _on(eventType, listener);
    //   });

    return this;
  }

  fitInLayout(layout: ILayout): this {
    const layoutRect = layout.layoutOfElement(this.selection().node()!)!;
    this.fitInSize(layoutRect);
    return this;
  }

  render(transitionDuration: number): this {
    this.selection().call(renderBars, this._barPositioner.bars(), transitionDuration);
    return this;
  }

  renderOrder(): number {
    return 0;
  }

  // renderedBars.on = function on(
  //   eventType: string,
  //   listener:
  //     | ((evnt: Event, barElement: SVGElement, index: number) => void)
  //     | null
  // ): Bars {
  //   if (listener) _eventListeners.set(eventType, listener);
  //   else _eventListeners.delete(eventType);
  //   _on(eventType, listener);
  //   return renderedBars;
  // };

  // # BarPositioner
  categories(categories?: Primitive[]): any {
    if (categories === undefined) return this._barPositioner.categories();
    this._barPositioner.categories(categories);
    return this;
  }
  values(values?: number[]): any {
    if (values === undefined) return this._barPositioner.values();
    this._barPositioner.values(values);
    return this;
  }
  orientation(orientation?: Orientation): any {
    if (orientation === undefined) return this._barPositioner.orientation();
    this._barPositioner.orientation(orientation);
    return this;
  }
  flipCategories(flip?: boolean): any {
    if (flip === undefined) return this._barPositioner.flipCategories();
    this._barPositioner.flipCategories(flip);
    return this;
  }
  flipValues(flip?: boolean): any {
    if (flip === undefined) return this._barPositioner.flipValues();
    this._barPositioner.flipValues(flip);
    return this;
  }
  categoryPadding(padding?: number): any {
    if (padding === undefined) return this._barPositioner.categoryPadding();
    this._barPositioner.categoryPadding(padding);
    return this;
  }
  fitInSize(size: Size): this {
    this._barPositioner.fitInSize(size);
    return this;
  }
  bars(): Bar[] {
    return this._barPositioner.bars();
  }
  categoriesScale(): ScaleBand<Primitive> {
    return this._barPositioner.categoriesScale();
  }
  valuesScale(): ScaleLinear<number, number> {
    return this._barPositioner.valuesScale();
  }
}

export function bars(): Bars {
  return new Bars();
}

export function renderBars(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  bars: Bar[],
  transitionDuration: number
): Selection<SVGGElement, Bar, SVGGElement, unknown> {
  return selection
    .selectAll<SVGGElement, Bar>('.bar')
    .data(bars)
    .join('g')
    .classed('bar', true)
    .each((d, i, nodes) => select(nodes[i]).call(renderClippedRect, d, transitionDuration));
}

export function renderClippedRect(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  rect: DOMRect,
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
            .call((s) => s.append('rect'))
        )

        .select('rect')
        .transition()
        .duration(transitionDuration)
        .attr('x', rect.x)
        .attr('y', rect.y)
        .attr('height', rect.height)
        .attr('width', rect.width)
    )
    .call((s: any) =>
      (s.selectChildren('rect') as Selection<SVGRectElement, unknown, BaseType, unknown>)
        .data([null])
        .join((enter) => enter.append('rect').attr('clip-path', `url(#${clipId})`))
        .transition()
        .duration(transitionDuration)
        .attr('x', rect.x)
        .attr('y', rect.y)
        .attr('height', rect.height)
        .attr('width', rect.width)
    );
}
