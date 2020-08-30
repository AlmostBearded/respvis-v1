import { IComponent } from '../component';
import { Size } from '../utils';
import { ILayout } from '../layout/layout';
import {
  Bar,
  BarPositioner,
  Orientation,
  IBarPositioner,
} from './bar-positioner';
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
  private _barPositioner = new BarPositioner();

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

  private _containerSelection: Selection<
    SVGGElement,
    unknown,
    BaseType,
    unknown
  >;

  private _barsSelection: Selection<SVGGElement, Bar, SVGGElement, unknown>;

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

    var boundingRect = selection.node()!.getBoundingClientRect();
    this.fitInSize(boundingRect);
    this.render(0);

    //   console.log(_eventListeners);
    //   _eventListeners.forEach((listener, eventType) => {
    //     _on(eventType, listener);
    //   });

    return this;
  }

  fitInLayout(layout: ILayout): this {
    var layoutRect = layout.layoutOfElement(this._containerSelection.node()!)!;
    this.fitInSize(layoutRect);
    return this;
  }

  render(transitionDuration: number): this {
    this._barsSelection = renderBars(
      this._containerSelection,
      this._barPositioner.bars(),
      transitionDuration
    );
    return this;
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
  categories(categories?: Primitive[]): this | Primitive[] {
    const result = this._barPositioner.categories(categories);
    return result instanceof BarPositioner ? this : result;
  }
  values(values?: number[][]): this | number[][] {
    const result = this._barPositioner.values(values);
    return result instanceof BarPositioner ? this : result;
  }
  orientation(orientation?: Orientation): this | Orientation {
    const result = this._barPositioner.orientation(orientation);
    return result instanceof BarPositioner ? this : result;
  }
  flipCategories(flip?: boolean): boolean | this {
    const result = this._barPositioner.flipCategories(flip);
    return result instanceof BarPositioner ? this : result;
  }
  flipValues(flip?: boolean): boolean | this {
    const result = this._barPositioner.flipValues(flip);
    return result instanceof BarPositioner ? this : result;
  }
  categoryPadding(padding?: number): number | this {
    const result = this._barPositioner.categoryPadding(padding);
    return result instanceof BarPositioner ? this : result;
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

function renderBars(
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
