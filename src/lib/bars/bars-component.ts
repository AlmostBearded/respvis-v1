import { ComponentEventData, BaseChartComponent, Rect } from '../core';
import { Selection, BaseType, EnterElement, select } from 'd3-selection';
import { ScaleBand, ScaleContinuousNumeric } from 'd3-scale';
import { SelectionOrTransition } from 'd3-transition';
import { Size } from '../core/utils';

export type CreateBarsFunction = (
  enterSelection: Selection<EnterElement, BarData, any, any>
) => Selection<SVGRectElement, BarData, any, any>;

export type RemoveBarsFunction = (
  exitSelection: Selection<SVGRectElement, BarData, any, any>
) => void;

export type UpdateBarsFunction = (
  selection: SelectionOrTransition<SVGRectElement, BarData, any, any>
) => void;

export type BarsEventData = ComponentEventData<BaseChartComponent> & BarData;

// export class BarsComponent
//   extends MediaQueryConfiguratorsMixin(ConfiguratorsMixin(LayoutTransformMixin(ChartComponent)))
//   implements Bars {
//   private _barsCalculator: BarsCalculator;
//   private _transitionDelay: number;
//   private _transitionDuration: number;
//   private _onCreateBars: CreateBarsFunction;
//   private _onRemoveBars: RemoveBarsFunction;
//   private _onUpdateBars: UpdateBarsFunction;

//   static defaultColor = categoricalColors[0];

//   constructor() {
//     super('g');

//     this._barsCalculator = new BarsCalculator();
//     this._transitionDuration = 250;
//     this._transitionDelay = 250;
//     this._onCreateBars = createBars;
//     this._onRemoveBars = (selection) => removeBars(selection, this._transitionDuration);
//     this._onUpdateBars = updateBars;
//     this.classed('bars', true)
//       .attr('fill', BarsComponent.defaultColor)
//       .attr('layout', '0, 0, 600, 400');
//   }

//   mainValues(): any[];
//   mainValues(values: any[]): this;
//   mainValues(values?: any[]): any[] | this {
//     if (values === undefined) return this._barsCalculator.mainValues();
//     this._barsCalculator.mainValues(values);
//     return this;
//   }

//   mainScale(): ScaleBand<any>;
//   mainScale(scale: ScaleBand<any>): this;
//   mainScale(scale?: ScaleBand<any>): ScaleBand<any> | this {
//     if (scale === undefined) return this._barsCalculator.mainScale();
//     this._barsCalculator.mainScale(scale);
//     return this;
//   }

//   crossValues(): any[];
//   crossValues(values: any[]): this;
//   crossValues(values?: any[]): any[] | this {
//     if (values === undefined) return this._barsCalculator.crossValues();
//     this._barsCalculator.crossValues(values);
//     return this;
//   }

//   crossScale(): ScaleContinuousNumeric<number, number>;
//   crossScale(scale: ScaleContinuousNumeric<number, number>): this;
//   crossScale(
//     scale?: ScaleContinuousNumeric<number, number>
//   ): ScaleContinuousNumeric<number, number> | this {
//     if (scale === undefined) return this._barsCalculator.crossScale();
//     this._barsCalculator.crossScale(scale);
//     return this;
//   }

//   orientation(): BarOrientation;
//   orientation(orientation: BarOrientation): this;
//   orientation(orientation?: BarOrientation): BarOrientation | this {
//     if (orientation === undefined) return this._barsCalculator.orientation();
//     this._barsCalculator.orientation(orientation);
//     return this;
//   }

//   barData(): BarData[] {
//     return this._barsCalculator.barData();
//   }

//   keys(): string[];
//   keys(keys: null): this;
//   keys(keys: string[]): this;
//   keys(keys?: string[] | null) {
//     if (keys === undefined) return this._barsCalculator.keys();
//     if (keys === null) this._barsCalculator.keys(null);
//     else this._barsCalculator.keys(keys);
//     return this;
//   }

//   transitionDuration(): number;
//   transitionDuration(duration: number): this;
//   transitionDuration(duration?: number): number | this {
//     if (duration === undefined) return this._transitionDuration;
//     this._transitionDuration = duration;
//     return this;
//   }

//   transitionDelay(): number;
//   transitionDelay(delay: number): this;
//   transitionDelay(delay?: number): number | this {
//     if (delay === undefined) return this._transitionDelay;
//     this._transitionDelay = delay;
//     return this;
//   }

//   onCreateBars(): CreateBarsFunction;
//   onCreateBars(callback: CreateBarsFunction): this;
//   onCreateBars(callback?: CreateBarsFunction): CreateBarsFunction | this {
//     if (callback === undefined) return this._onCreateBars;
//     this._onCreateBars = callback;
//     return this;
//   }

//   onRemoveBars(): RemoveBarsFunction;
//   onRemoveBars(callback: RemoveBarsFunction): this;
//   onRemoveBars(callback?: RemoveBarsFunction): RemoveBarsFunction | this {
//     if (callback === undefined) return this._onRemoveBars;
//     this._onRemoveBars = callback;
//     return this;
//   }

//   onUpdateBars(): UpdateBarsFunction;
//   onUpdateBars(callback: UpdateBarsFunction): this;
//   onUpdateBars(callback?: any) {
//     if (callback === undefined) return this._onUpdateBars;
//     this._onUpdateBars = callback;
//     return this;
//   }

//   afterLayout(): this {
//     super.afterLayout();
//     console.assert(this.attr('layout') !== null, 'layout attribute must be specified');
//     this._barsCalculator.fitInSize(rectFromString(this.attr('layout')!));
//     return this;
//   }

//   render(): this {
//     super.render();
//     this.selection()
//       .selectAll<SVGRectElement, BarData>('.bar')
//       .data(this._barsCalculator.barData(), (d) => d.key)
//       .join(this._onCreateBars, undefined, this._onRemoveBars)
//       .call(this._onUpdateBars);
//     return this;
//   }

//   transition(): this {
//     super.transition();
//     this.selection()
//       .selectAll<SVGRectElement, BarData>('.bar')
//       .data(this._barsCalculator.barData(), (d) => d.key)
//       .join(this._onCreateBars, undefined, this._onRemoveBars)
//       .transition()
//       .delay(this._transitionDelay)
//       .duration(this._transitionDuration)
//       .call(this._onUpdateBars);
//     return this;
//   }

//   eventData(event: Event): BarsEventData<this> | null {
//     const element = event.target as SVGRectElement;
//     const barSelection = select<SVGRectElement, BarData>(element);
//     if (barSelection.classed('exiting')) return null;
//     return {
//       component: this,
//       ...barSelection.datum(),
//     };
//   }
// }

export enum BarOrientation {
  Vertical,
  Horizontal,
}

export interface BarData {
  mainIndex: number;
  key: string;
  rect: Rect<number>;
}

export interface BarDataCreationProperties {
  mainValues: any[];
  mainScale: ScaleBand<any>;
  crossValues: any[];
  crossScale: ScaleContinuousNumeric<number, number>;
  keys: string[] | undefined;
  orientation: BarOrientation;
}

export interface BarsComponentInputProperties extends BarDataCreationProperties {
  transitionDuration: number;
  transitionDelay: number;
}

export interface BarsComponentOutputProperties {
  barData: BarData[];
}

export function createBarData(props: BarDataCreationProperties, boundsSize: Size): BarData[] {
  if (props.orientation === BarOrientation.Vertical) {
    props.mainScale.range([0, boundsSize.width]);
    props.crossScale.range([boundsSize.height, 0]);
  } else if (props.orientation === BarOrientation.Horizontal) {
    props.mainScale.range([0, boundsSize.height]);
    props.crossScale.range([0, boundsSize.width]);
  }

  const barData: BarData[] = [];

  for (let i = 0; i < props.crossValues.length; ++i) {
    const mv = props.mainValues[i];
    const cv = props.crossValues[i];

    if (props.orientation === BarOrientation.Vertical) {
      barData.push({
        mainIndex: i,
        key: props.keys?.[i] || i.toString(),
        rect: {
          x: props.mainScale(mv)!,
          y: Math.min(props.crossScale(0)!, props.crossScale(cv)!),
          width: props.mainScale.bandwidth(),
          height: Math.abs(props.crossScale(0)! - props.crossScale(cv)!),
        },
      });
    } else if (props.orientation === BarOrientation.Horizontal) {
      barData.push({
        mainIndex: i,
        key: props.keys?.[i] || i.toString(),
        rect: {
          x: Math.min(props.crossScale(0)!, props.crossScale(cv)!),
          y: props.mainScale(mv)!,
          width: Math.abs(props.crossScale(0)! - props.crossScale(cv)!),
          height: props.mainScale.bandwidth(),
        },
      });
    }
  }
  return barData;
}

export function createBarEventData(event: Event): BarsEventData | null {
  // todo: sanity checks
  const element = event.target as SVGRectElement;
  const barSelection = select<SVGRectElement, BarData>(element);
  if (barSelection.classed('exiting')) return null;
  return {
    component: this,
    ...barSelection.datum(),
  };
}

export function bars(): BaseChartComponent {
  return new BaseChartComponent<BarsComponentInputProperties, BarsComponentOutputProperties>('g');
}

export function createBars(
  enterSelection: Selection<EnterElement, BarData, any, any>
): Selection<SVGRectElement, any, any, any> {
  return enterSelection
    .append('rect')
    .classed('bar', true)
    .attr('x', (d) => d.rect.x + d.rect.width / 2)
    .attr('y', (d) => d.rect.y + d.rect.height / 2)
    .attr('width', 0)
    .attr('height', 0);
}

export function removeBars(
  exitSelection: Selection<any, BarData, any, any>,
  transitionDuration: number
): void {
  exitSelection
    .classed('exiting', true)
    .transition()
    .duration(transitionDuration)
    .attr('x', (d) => d.rect.x + d.rect.width / 2)
    .attr('y', (d) => d.rect.y + d.rect.height / 2)
    .attr('width', 0)
    .attr('height', 0)
    .remove();
}

export function updateBars(selection: SelectionOrTransition<BaseType, BarData, any, any>): void {
  selection
    .attr('x', (d) => d.rect.x)
    .attr('y', (d) => d.rect.y)
    .attr('width', (d) => d.rect.width)
    .attr('height', (d) => d.rect.height);
}
