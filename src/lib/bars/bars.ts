import { IComponent } from '../component';
import { Size } from '../utils';
import { ILayout } from '../layout/layout';
import { Bar, BarPositioner, Orientation, IBarPositioner } from './bar-positioner';
import { Selection, BaseType } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { max, merge, Primitive } from 'd3-array';
import 'd3-transition';

export interface IBars extends IComponent, IBarPositioner {
  // on(
  //   eventType: string,
  //   listener:
  //     | ((evnt: Event, barElement: SVGElement, index: number) => void)
  //     | null
  // ): Bars;
}

export class Bars implements IBars {
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

  private _containerSelection: Selection<SVGGElement, unknown, BaseType, unknown>;

  constructor() {}

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
    this._containerSelection = selection
      .selectAll<SVGGElement, unknown>('.bars')
      .data([null])
      .join('g')
      .classed('bars', true);

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
    const layoutRect = layout.layoutOfElement(this._containerSelection.node()!)!;
    this.fitInSize(layoutRect);

    const clipRect: Bar = Object.assign(layoutRect, { x: 0, y: 0 });
    this._containerSelection.call(renderClipRect, clipRect, 'bar-clip-rect');

    return this;
  }

  render(transitionDuration: number): this {
    this._containerSelection
      .call(renderBars, this._barPositioner.bars(), transitionDuration)
      .selectAll('.bar rect')
      .attr('clip-path', 'url(#bar-clip-rect)');
    return this;
  }

  selection(): Selection<SVGElement, unknown, BaseType, unknown> {
    return this._containerSelection;
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
  const barsSelection = selection
    .selectAll<SVGGElement, Bar>('.bar')
    .data(bars)
    .join((enter) => enter.append('g').classed('bar', true));

  barsSelection
    .selectAll('rect')
    .data((d) => [d])
    .join('rect')
    .transition()
    .duration(transitionDuration)
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('height', (d) => d.height)
    .attr('width', (d) => d.width);

  return barsSelection;
}

export function renderClipRect(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  rect: Bar,
  id: string
) {
  selection
    .selectAll(`#${id}`)
    .data([null])
    .join('clipPath')
    .attr('id', id)
    .selectAll('rect')
    .data([null])
    .join('rect')
    .attr('x', rect.x)
    .attr('y', rect.y)
    .attr('height', rect.height)
    .attr('width', rect.width);
}
