import { BaseType, create, Selection } from 'd3-selection';
import {
  chainedTransition,
  clipByItself,
  clipBySelection,
  colors,
  Component,
  IAttributes,
  IComponent,
  IComponentConfig,
  IComponentEventData,
  Rect,
  IRect,
  setAttributes,
  setBoundAttributes,
  setUniformAttributes,
  setUniformNestedAttributes,
  transitionBoundAttributes,
  utils,
} from '../core';
import { linearScale } from '../core';
import {
  IPointPositioner,
  IPointPositionerConfig,
  IPoints,
  PointPositioner,
} from './point-positioner';

export interface IPointsComponentConfig extends IComponentConfig, IPointPositionerConfig {
  createCircles: (
    selection: Selection<BaseType, IAttributes, any, unknown>
  ) => Selection<SVGCircleElement, IAttributes, any, unknown>;
  transitionDuration: number;
  events: utils.IDictionary<(event: Event, data: IPointsEventData) => void>;
}

export interface IPointsEventData extends IComponentEventData {
  index: number;
  element: SVGCircleElement;
}

export interface IPointsComponent extends IComponent<IPointsComponentConfig>, IPoints {
  inTransition(): boolean;
}

export class PointsComponent extends Component<IPointsComponentConfig> implements IPointsComponent {
  private _pointPositioner: IPointPositioner = new PointPositioner();
  private _clipRectSelection: Selection<SVGRectElement, unknown, BaseType, unknown>;
  private _inTransition = false;

  static defaultColor = colors.categorical[0];

  static setEventListeners(component: PointsComponent, config: IPointsComponentConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        const element = e.target as SVGCircleElement;
        const index = Array.prototype.indexOf.call(element.parentNode!.children, element);
        config.events[typenames](e, {
          component: component,
          index: index,
          element: element,
        });
      });
    }
  }

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('points', true),
      {
        categories: [],
        categoryScale: { scale: linearScale<number>(), domain: [], nice: true },
        values: [],
        valueScale: { scale: linearScale<number>(), domain: [], nice: true },
        attributes: {
          fill: PointsComponent.defaultColor,
          stroke: '#232323',
          'stroke-width': 1,
          '.point': {
            r: 4,
          },
        },
        transitionDuration: 0,
        events: {},
        responsiveConfigs: {},
        createCircles: createCircles,
        parseConfig: (
          previousConfig: IPointsComponentConfig,
          newConfig: IPointsComponentConfig
        ) => {},
        applyConfig: (
          previousConfig: IPointsComponentConfig,
          newConfig: IPointsComponentConfig
        ) => {
          PointsComponent.clearEventListeners(this, previousConfig);
          PointsComponent.setEventListeners(this, newConfig);
          this._pointPositioner.config(newConfig);
          // TODO: delete all points if the createCircles property changes?
        },
      },
      Component.mergeConfigs
    );
    this._clipRectSelection = create<SVGRectElement>('svg:rect');
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node()).call(clipBySelection, this._clipRectSelection);
    return this;
  }

  render(animated: boolean): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout') || '0, 0, 600, 400');
    this._pointPositioner.fitInSize(layoutRect);

    this._clipRectSelection.call(setUniformAttributes, {
      x: 0,
      y: 0,
      width: layoutRect.width,
      height: layoutRect.height,
    });

    const config = this.activeConfig();

    const attributes: IAttributes[] = this._pointPositioner
      .points()
      .map((center) => ({ cx: center.x, cy: center.y }));

    const circlesSelection = this.selection()
      .selectAll<SVGElement, IAttributes>('circle')
      .data(attributes)
      .join(config.createCircles);

    if (animated && config.transitionDuration > 0) {
      this._inTransition = true;
      circlesSelection
        .transition()
        .duration(config.transitionDuration)
        .call(transitionBoundAttributes)
        .end()
        .then(() => (this._inTransition = false))
        .catch(() => ({}));
    } else circlesSelection.call(setBoundAttributes);

    this.selection().call(setUniformNestedAttributes, config.attributes);

    return this;
  }

  points(): utils.IPosition[] {
    return this._pointPositioner.points();
  }

  inTransition(): boolean {
    return this._inTransition;
  }
}

export function points(): PointsComponent {
  return new PointsComponent();
}

export function createCircles(
  selection: Selection<BaseType, IAttributes, SVGElement, unknown>
): Selection<SVGCircleElement, IAttributes, SVGElement, unknown> {
  return selection.append('circle').classed('point', true).call(setBoundAttributes);
}

export function createClippedCircles(
  selection: Selection<BaseType, IAttributes, SVGElement, unknown>
): Selection<SVGCircleElement, IAttributes, SVGElement, unknown> {
  return selection
    .append('circle')
    .classed('point', true)
    .call(clipByItself)
    .call(setBoundAttributes);
}
