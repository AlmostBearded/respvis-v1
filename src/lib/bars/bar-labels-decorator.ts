import { Selection, BaseType, create, select, EnterElement } from 'd3-selection';
import { IPoints } from '../points';
import { createDropShadowFilter } from '../core/filter';
import { ContainerComponent } from '../core/components/container-component';
import { ComponentDecorator } from '../core';
import { BarPoints, BarPointsCalculator } from './bar-points';
import { Bars } from './bars';
import { IPosition, IStringable } from '../core/utils';

// export interface IBarLabelsConfig extends IComponentConfig, IBarPointPositionerConfig {
//   createLabels: (
//     selection: Selection<BaseType, IAttributes, any, any>,
//     containerSelection: Selection<SVGElement, any, any, unknown>
//   ) => Selection<SVGGElement, IAttributes, any, any>;
//   labels: utils.IStringable[];
//   transitionDuration: number;
//   events: utils.IDictionary<(event: Event, data: IBarLabelsEventData) => void>;
// }

// export interface IBarLabelsEventData extends IComponentEventData {
//   labelIndex: number;
// }

export interface LabelData {
  position: IPosition;
  text: string;
}

export type CreateLabelsFunction = (
  enterSelection: Selection<EnterElement, LabelData, any, any>
) => Selection<BaseType, any, any, any>;

export class BarLabelsDecorator
  extends ComponentDecorator<ContainerComponent>
  implements BarPoints {
  private _barPoints: BarPoints;
  private _labels: IStringable[];
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreateLabels: CreateLabelsFunction;

  constructor(bars: Bars, component: ContainerComponent) {
    super(component);
    this._barPoints = new BarPointsCalculator(bars);
    this._labels = [];
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreateLabels = (enter) =>
      enter
        .append('text')
        .attr('transform', (d) => `translate(${d.position.x}, ${d.position.y})`)
        .text((d) => d.text);

    this.component()
      .classed('bar-labels', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-weight', 'normal');
  }

  bars(): Bars;
  bars(bars: Bars): this;
  bars(bars?: any): this | Bars {
    if (bars === undefined) return this._barPoints.bars();
    this._barPoints.bars(bars);
    return this;
  }

  labels(): IStringable[];
  labels(labels: IStringable[]): this;
  labels(labels?: any) {
    if (labels === undefined) return this._labels;
    this._labels = labels;
    return this;
  }

  heightPercent(): number;
  heightPercent(percent: number): this;
  heightPercent(percent?: any): number | this {
    if (percent === undefined) return this._barPoints.heightPercent();
    this._barPoints.heightPercent(percent);
    return this;
  }

  widthPercent(): number;
  widthPercent(percent: number): this;
  widthPercent(percent?: any): number | this {
    if (percent === undefined) return this._barPoints.widthPercent();
    this._barPoints.widthPercent(percent);
    return this;
  }

  points(): IPosition[] {
    return this._barPoints.points();
  }

  transitionDuration(): number;
  transitionDuration(duration: number): this;
  transitionDuration(duration?: number): number | this {
    if (duration === undefined) return this._transitionDuration;
    this._transitionDuration = duration;
    return this;
  }

  transitionDelay(): number;
  transitionDelay(delay: number): this;
  transitionDelay(delay?: number): number | this {
    if (delay === undefined) return this._transitionDelay;
    this._transitionDelay = delay;
    return this;
  }

  onCreateLabels(): CreateLabelsFunction;
  onCreateLabels(callback: CreateLabelsFunction): this;
  onCreateLabels(callback?: CreateLabelsFunction): CreateLabelsFunction | this {
    if (callback === undefined) return this._onCreateLabels;
    this._onCreateLabels = callback;
    return this;
  }

  render(): this {
    super.render();
    const labelData: LabelData[] = this._barPoints
      .points()
      .map((p, i) => ({ position: p, text: this._labels[i].toString() }));
    this.component()
      .selection()
      .selectAll('text')
      .data(labelData)
      .join(this._onCreateLabels)
      .attr('transform', (d) => `translate(${d.position.x}, ${d.position.y})`)
      .text((d) => d.text);
    return this;
  }

  transition(): this {
    super.transition();
    const labelData: LabelData[] = this._barPoints
      .points()
      .map((p, i) => ({ position: p, text: this._labels[i].toString() }));
    this.component()
      .selection()
      .selectAll('text')
      .data(labelData)
      .join(this._onCreateLabels)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .attr('transform', (d) => `translate(${d.position.x}, ${d.position.y})`)
      .text((d) => d.text);
    return this;
  }

  // static setEventListeners(component: BarLabelsComponent, config: IBarLabelsConfig) {
  //   for (const typenames in config.events) {
  //     component.selection().on(typenames, (e: Event) => {
  //       const textElement = e.target as SVGTextElement;
  //       const labelElement = textElement.parentNode!;
  //       const indexOf = Array.prototype.indexOf;
  //       const labelIndex = indexOf.call(labelElement.parentNode!.children, labelElement);
  //       config.events[typenames](e, {
  //         component: component,
  //         labelIndex: labelIndex,
  //       });
  //     });
  //   }
  // }

  // constructor() {
  //   super(
  //     {
  //       labels: [],
  //       horizontalPosition: HorizontalPosition.Center,
  //       verticalPosition: VerticalPosition.Center,
  //       transitionDuration: 0,
  //       attributes: {
  //         text: {
  //           'text-anchor': 'middle',
  //           'dominant-baseline': 'middle',
  //           'font-weight': 'normal',
  //         },
  //       },
  //       responsiveConfigs: {},
  //       events: {},
  //       createLabels: createLabels,
  //       parseConfig: (previousConfig: IBarLabelsConfig, newConfig: IBarLabelsConfig) => {},
  //       applyConfig: (previousConfig: IBarLabelsConfig, newConfig: IBarLabelsConfig) => {
  //         BarLabelsComponent.clearEventListeners(this, previousConfig);
  //         BarLabelsComponent.setEventListeners(this, newConfig);
  //         this._barPointPositioner.config(newConfig);
  //       },
  //     },
  //     Component.mergeConfigs
  //   );
  // }

  // mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
  //   selection.append(() => this.selection().node());
  //   return this;
  // }

  // render(animated: boolean): this {
  //   const config = this.activeConfig();

  //   const attributes: IAttributes[] = this._barPointPositioner
  //     .points()
  //     .map((point) => ({ transform: `translate(${point.x}, ${point.y})` }));

  //   const labelsSelection = this.selection()
  //     .selectAll('.label')
  //     .data(attributes)
  //     .join((enter) => config.createLabels(enter, this.selection()));

  //   if (animated && config.transitionDuration > 0)
  //     labelsSelection
  //       .transition()
  //       .duration(config.transitionDuration)
  //       .call(transitionBoundAttributes);
  //   else labelsSelection.call(setBoundAttributes);

  //   this.selection()
  //     .selectAll('text')
  //     .data(config.labels)
  //     .text((d) => d.toString());

  //   this.selection().call(setUniformNestedAttributes, config.attributes);

  //   return this;
  // }

  // points(): utils.IPosition[] {
  //   return this._barPointPositioner.points();
  // }
}

// export function createLabels(
//   selection: Selection<BaseType, IAttributes, SVGElement, unknown>,
//   containerSelection: Selection<SVGElement, any, SVGElement, unknown>
// ): Selection<SVGGElement, IAttributes, SVGElement, unknown> {
//   return selection
//     .append('g')
//     .classed('label', true)
//     .call(setBoundAttributes)
//     .call((g) => g.append('text'));
// }

// export function createLabelsWithDropShadow(
//   selection: Selection<BaseType, IAttributes, SVGElement, unknown>,
//   containerSelection: Selection<SVGElement, any, SVGElement, unknown>,
//   dropShadowFilterRect: IRect<string>,
//   dropShadowOffset: utils.IPosition,
//   dropShadowBlurStdDeviation: number
// ): Selection<SVGGElement, IAttributes, SVGElement, unknown> {
//   containerSelection
//     .selectAll('.drop-shadow')
//     .data([null])
//     .join((enter) =>
//       enter
//         .call(
//           createDropShadowFilter,
//           dropShadowFilterRect,
//           dropShadowOffset,
//           dropShadowBlurStdDeviation
//         )
//         .select('defs')
//     );

//   const filterSelection = containerSelection.select('.drop-shadow');
//   const filterId = filterSelection.attr('id');

//   return selection
//     .append('g')
//     .classed('label', true)
//     .call(setBoundAttributes)
//     .call((g) => g.append('text').attr('filter', `url(#${filterId})`));
// }
