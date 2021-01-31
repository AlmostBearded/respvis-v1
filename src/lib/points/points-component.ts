import { BaseType, EnterElement, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
import {
  BaseComponent,
  categoricalColors,
  Component,
  ComponentEventData,
  rectFromString,
  ScaleAny,
} from '../core';
import { IPosition } from '../core/utils';
import { Points, PointsCalculator } from './points';

export interface PointData {
  index: number;
  key: string;
  center: IPosition;
  radius: number;
}

export interface PointsEventData<TComponent extends Component>
  extends ComponentEventData<TComponent> {
  index: number;
  element: SVGCircleElement;
}

export type CreatePointsFunction = (
  enterSelection: Selection<EnterElement, PointData, any, any>
) => Selection<SVGCircleElement, any, any, any>;

export type RemovePointsFunction = (exitSelection: Selection<any, PointData, any, any>) => void;

export type UpdatePointsFunction = (
  selection: SelectionOrTransition<BaseType, PointData, any, any>
) => void;

export class PointsComponent extends BaseComponent implements Points {
  private _calculator: PointsCalculator;
  private _keys: string[] | undefined;
  private _transitionDelay: number;
  private _transitionDuration: number;
  private _onCreatePoints: CreatePointsFunction;
  private _onRemovePoints: RemovePointsFunction;
  private _onUpdatePoints: UpdatePointsFunction;

  static defaultColor = categoricalColors[0];

  constructor() {
    super('g');

    this._calculator = new PointsCalculator();
    this._transitionDuration = 250;
    this._transitionDelay = 250;
    this._onCreatePoints = createPoints;
    this._onRemovePoints = (selection) => removePoints(selection, this._transitionDuration);
    this._onUpdatePoints = updatePoints;
    this.classed('points', true)
      .attr('fill', PointsComponent.defaultColor)
      .attr('layout', '0, 0, 600, 400');
  }

  xValues(): any[];
  xValues(values: any[]): this;
  xValues(values?: any) {
    if (values === undefined) return this._calculator.xValues();
    this._calculator.xValues(values);
    return this;
  }

  xScale(): ScaleAny<string | number | Date, number, number>;
  xScale(scale: ScaleAny<string | number | Date, number, number>): this;
  xScale(scale?: any) {
    if (scale === undefined) return this._calculator.xScale();
    this._calculator.xScale(scale);
    return this;
  }

  yValues(): any[];
  yValues(values: any[]): this;
  yValues(values?: any) {
    if (values === undefined) return this._calculator.yValues();
    this._calculator.yValues(values);
    return this;
  }

  yScale(): ScaleAny<string | number | Date, number, number>;
  yScale(scale: ScaleAny<string | number | Date, number, number>): this;
  yScale(scale?: any) {
    if (scale === undefined) return this._calculator.yScale();
    this._calculator.yScale(scale);
    return this;
  }

  radiuses(): any[];
  radiuses(values: any[]): this;
  radiuses(values?: any) {
    if (values === undefined) return this._calculator.radiuses();
    this._calculator.radiuses(values);
    return this;
  }

  radiusScale(): ScaleAny<string | number | Date, number, number>;
  radiusScale(scale: ScaleAny<string | number | Date, number, number>): this;
  radiusScale(scale?: any) {
    if (scale === undefined) return this._calculator.radiusScale();
    this._calculator.radiusScale(scale);
    return this;
  }

  points(): { center: IPosition; radius: number }[] {
    return this._calculator.points();
  }

  keys(): string[];
  keys(keys: null): this;
  keys(keys: string[]): this;
  keys(keys?: string[] | null) {
    if (keys === undefined) return this._keys;
    if (keys === null) this._keys = undefined;
    else this._keys = keys;
    return this;
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

  onCreatePoints(): CreatePointsFunction;
  onCreatePoints(callback: CreatePointsFunction): this;
  onCreatePoints(callback?: CreatePointsFunction): CreatePointsFunction | this {
    if (callback === undefined) return this._onCreatePoints;
    this._onCreatePoints = callback;
    return this;
  }

  onRemovePoints(): RemovePointsFunction;
  onRemovePoints(callback: RemovePointsFunction): this;
  onRemovePoints(callback?: RemovePointsFunction): RemovePointsFunction | this {
    if (callback === undefined) return this._onRemovePoints;
    this._onRemovePoints = callback;
    return this;
  }

  onUpdatePoints(): UpdatePointsFunction;
  onUpdatePoints(callback: UpdatePointsFunction): this;
  onUpdatePoints(callback?: any) {
    if (callback === undefined) return this._onUpdatePoints;
    this._onUpdatePoints = callback;
    return this;
  }

  afterLayout(): this {
    super.afterLayout();
    this._calculator.fitInSize(rectFromString(this.attr('layout')));
    return this;
  }

  pointData(): PointData[] {
    return this._calculator.points().map((p, i) => ({
      index: i,
      key: this._keys?.[i] || i.toString(),
      ...p,
    }));
  }

  render(): this {
    super.render();
    this.selection()
      .selectAll('circle')
      .data(this.pointData(), (d: PointData) => d.key)
      .join(this._onCreatePoints, undefined, this._onRemovePoints)
      .call(this._onUpdatePoints);
    return this;
  }

  transition(): this {
    super.transition();
    this.selection()
      .selectAll('circle')
      .data(this.pointData(), (d: PointData) => d.key)
      .join(this._onCreatePoints, undefined, this._onRemovePoints)
      .transition()
      .delay(this._transitionDelay)
      .duration(this._transitionDuration)
      .call(this._onUpdatePoints);
    return this;
  }

  eventData(event: Event): PointsEventData<this> {
    const element = event.target as SVGCircleElement;
    const rootElement = element.parentNode! as Element;

    let index = Array.prototype.indexOf.call(rootElement.children, element);
    for (let i = 0; i <= index; ++i)
      if (rootElement.children[i].classList.contains('exiting')) --index;

    return {
      component: this,
      index: index,
      element: element,
    };
  }
}

export function points(): PointsComponent {
  return new PointsComponent();
}

export function createPoints(
  enterSelection: Selection<EnterElement, PointData, any, any>
): Selection<SVGCircleElement, any, any, any> {
  return enterSelection
    .append('circle')
    .classed('point', true)
    .attr('cx', (d) => d.center.x)
    .attr('cy', (d) => d.center.y)
    .attr('r', 0);
}

export function removePoints(
  exitSelection: Selection<any, PointData, any, any>,
  transitionDuration: number
): void {
  exitSelection
    .classed('exiting', true)
    .transition()
    .duration(transitionDuration)
    .attr('r', 0)
    .remove();
}

export function updatePoints(
  selection: SelectionOrTransition<BaseType, PointData, any, any>
): void {
  selection
    .attr('cx', (d) => d.center.x)
    .attr('cy', (d) => d.center.y)
    .attr('r', (d) => d.radius);
}

// export interface IPointsComponentConfig extends IComponentConfig, IPointPositionerConfig {
//   createCircles: (
//     selection: Selection<BaseType, IAttributes, any, unknown>
//   ) => Selection<SVGCircleElement, IAttributes, any, unknown>;
//   transitionDuration: number;
//   events: utils.IDictionary<(event: Event, data: IPointsEventData) => void>;
// }

// export interface IPointsEventData extends IComponentEventData {
//   index: number;
//   element: SVGCircleElement;
// }

// export interface IPointsComponent extends IComponent<IPointsComponentConfig>, IPoints {
//   inTransition(): boolean;
// }

// export class PointsComponent extends Component<IPointsComponentConfig> implements IPointsComponent {
//   private _pointPositioner: IPointPositioner = new PointPositioner();
//   private _clipRectSelection: Selection<SVGRectElement, unknown, BaseType, unknown>;
//   private _inTransition = false;

//   static defaultColor = colors.categoricalColors[0];

//   static setEventListeners(component: PointsComponent, config: IPointsComponentConfig) {
//     for (const typenames in config.events) {
//       component.selection().on(typenames, (e: Event) => {
//         const element = e.target as SVGCircleElement;
//         const index = Array.prototype.indexOf.call(element.parentNode!.children, element);
//         config.events[typenames](e, {
//           component: component,
//           index: index,
//           element: element,
//         });
//       });
//     }
//   }

//   constructor() {
//     super(
//       create<SVGElement>('svg:g').classed('points', true),
//       {
//         categories: [],
//         categoryScale: { scale: linearScale<number>(), domain: [], nice: true },
//         values: [],
//         valueScale: { scale: linearScale<number>(), domain: [], nice: true },
//         attributes: {
//           fill: PointsComponent.defaultColor,
//           stroke: '#232323',
//           'stroke-width': 1,
//           '.point': {
//             r: 4,
//           },
//         },
//         transitionDuration: 0,
//         events: {},
//         responsiveConfigs: {},
//         createCircles: createCircles,
//         parseConfig: (
//           previousConfig: IPointsComponentConfig,
//           newConfig: IPointsComponentConfig
//         ) => {},
//         applyConfig: (
//           previousConfig: IPointsComponentConfig,
//           newConfig: IPointsComponentConfig
//         ) => {
//           PointsComponent.clearEventListeners(this, previousConfig);
//           PointsComponent.setEventListeners(this, newConfig);
//           this._pointPositioner.config(newConfig);
//           // TODO: delete all points if the createCircles property changes?
//         },
//       },
//       Component.mergeConfigs
//     );
//     this._clipRectSelection = create<SVGRectElement>('svg:rect');
//   }

//   mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
//     selection.append(() => this.selection().node()).call(clipBySelection, this._clipRectSelection);
//     return this;
//   }

//   render(animated: boolean): this {
//     const layoutRect = Rect.fromString(this.selection().attr('layout') || '0, 0, 600, 400');
//     this._pointPositioner.fitInSize(layoutRect);

//     this._clipRectSelection.call(setUniformAttributes, {
//       x: 0,
//       y: 0,
//       width: layoutRect.width,
//       height: layoutRect.height,
//     });

//     const config = this.activeConfig();

//     const attributes: IAttributes[] = this._pointPositioner
//       .points()
//       .map((center) => ({ cx: center.x, cy: center.y }));

//     const circlesSelection = this.selection()
//       .selectAll<SVGElement, IAttributes>('circle')
//       .data(attributes)
//       .join(config.createCircles);

//     if (animated && config.transitionDuration > 0) {
//       this._inTransition = true;
//       circlesSelection
//         .transition()
//         .duration(config.transitionDuration)
//         .call(transitionBoundAttributes)
//         .end()
//         .then(() => (this._inTransition = false))
//         .catch(() => ({}));
//     } else circlesSelection.call(setBoundAttributes);

//     this.selection().call(setUniformNestedAttributes, config.attributes);

//     return this;
//   }

//   points(): utils.IPosition[] {
//     return this._pointPositioner.points();
//   }

//   inTransition(): boolean {
//     return this._inTransition;
//   }
// }

// export function points(): PointsComponent {
//   return new PointsComponent();
// }

// export function createCircles(
//   selection: Selection<BaseType, IAttributes, SVGElement, unknown>
// ): Selection<SVGCircleElement, IAttributes, SVGElement, unknown> {
//   return selection.append('circle').classed('point', true).call(setBoundAttributes);
// }

// export function createClippedCircles(
//   selection: Selection<BaseType, IAttributes, SVGElement, unknown>
// ): Selection<SVGCircleElement, IAttributes, SVGElement, unknown> {
//   return selection
//     .append('circle')
//     .classed('point', true)
//     .call(clipByItself)
//     .call(setBoundAttributes);
// }
