import { BaseType, create, Selection } from 'd3-selection';
import {
  clipByItself,
  colors,
  Component,
  IAttributes,
  IComponent,
  IComponentConfig,
  Rect,
  setAttributes,
  setUniformNestedAttributes,
  transitionAttributes,
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
  // TODO: Add events
}

export interface IPointsComponent extends IComponent<IPointsComponentConfig>, IPoints {}

export class PointsComponent extends Component<IPointsComponentConfig> implements IPointsComponent {
  private _pointPositioner: IPointPositioner = new PointPositioner();

  static defaultColor = colors.categorical[0];

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('points', true),
      {
        categories: [],
        categoryScale: { scale: linearScale<number>(), domain: [] },
        values: [],
        valueScale: { scale: linearScale<number>(), domain: [] },
        attributes: {
          fill: PointsComponent.defaultColor,
          stroke: '#232323',
          'stroke-width': 1,
          circle: {
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
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    return this;
  }

  render(animated: boolean): this {
    const layoutRect = Rect.fromString(this.selection().attr('layout') || '0, 0, 600, 400');
    this._pointPositioner.fitInSize(layoutRect);

    const config = this.activeConfig();

    const attributes: IAttributes[] = this._pointPositioner
      .points()
      .map((center) => ({ cx: center.x, cy: center.y, r: 0 }));

    const circlesSelection = this.selection()
      .selectAll<SVGElement, IAttributes>('circle')
      .data(attributes)
      .join(config.createCircles);

    if (animated && config.transitionDuration > 0)
      circlesSelection.transition().duration(config.transitionDuration).call(transitionAttributes);
    else circlesSelection.call(setAttributes);

    this.selection().datum(config.attributes).call(setUniformNestedAttributes).datum(null);

    return this;
  }

  points(): utils.IPosition[] {
    return this._pointPositioner.points();
  }
}

export function points(): PointsComponent {
  return new PointsComponent();
}

export function createCircles(
  selection: Selection<BaseType, IAttributes, SVGElement, unknown>
): Selection<SVGCircleElement, IAttributes, SVGElement, unknown> {
  return selection.append('circle').call(setAttributes);
}

export function createClippedCircles(
  selection: Selection<BaseType, IAttributes, SVGElement, unknown>
): Selection<SVGCircleElement, IAttributes, SVGElement, unknown> {
  return selection.append('circle').call(clipByItself).call(setAttributes);
}
