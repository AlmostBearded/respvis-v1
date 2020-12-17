import { BaseType, create, EnterElement, select, selection, Selection } from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';
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
  uuid,
} from '../core';
import { IScale, IScaleConfig, linearScale, pointScale } from './scales';

export interface IPoints {
  points(): utils.IPosition[];
}

export interface IPointPositionerConfig {
  categories: any[];
  categoryScale: IScaleConfig<any, number, number>;
  values: number[];
  valueScale: IScaleConfig<number, number, number>;
}

export interface IPointsComponentConfig extends IComponentConfig, IPointPositionerConfig {
  createCircles: (
    selection: Selection<BaseType, IAttributes, any, unknown>
  ) => Selection<SVGCircleElement, IAttributes, any, unknown>;
  transitionDuration: number;
  // TODO: Add events
}

export interface IPointPositioner extends IPoints {
  config(config: IPointPositionerConfig): this;
  config(): IPointPositionerConfig;
  fitInSize(size: utils.ISize): this;
}

export interface IPointsComponent extends IComponent<IPointsComponentConfig>, IPoints {}

export class PointPositioner implements IPointPositioner {
  private _config: IPointPositionerConfig;
  private _points: utils.IPosition[] = [];

  constructor() {
    this._config = {
      categories: [],
      categoryScale: { scale: linearScale(), domain: [] },
      values: [],
      valueScale: { scale: linearScale(), domain: [] },
    };
  }

  config(config: IPointPositionerConfig): this;
  config(): IPointPositionerConfig;
  config(config?: IPointPositionerConfig): any {
    if (config === undefined) return this._config;
    utils.deepExtend(this._config, config);
    this._config.categoryScale.scale.domain(this._config.categoryScale.domain);
    this._config.valueScale.scale.domain(this._config.valueScale.domain);
    return this;
  }

  fitInSize(size: utils.ISize): this {
    this._config.categoryScale.scale.range([0, size.width]);
    this._config.valueScale.scale.range([size.height, 0]);

    this._points = [];

    for (let i = 0; i < this._config.categories.length; ++i) {
      const c = this._config.categories[i],
        v = this._config.values[i];
      this._points.push({
        x: this._config.categoryScale.scale(c)!,
        y: this._config.valueScale.scale(v)!,
      });
    }

    return this;
  }

  points(): utils.IPosition[] {
    return this._points;
  }
}

export class PointsComponent extends Component<IPointsComponentConfig> implements IPointsComponent {
  private _pointPositioner: IPointPositioner = new PointPositioner();

  static defaultColor = colors.categorical[0];

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('points', true),
      {
        categories: [],
        categoryScale: { scale: pointScale(), domain: [] },
        values: [],
        valueScale: { scale: linearScale(), domain: [] },
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
          // TODO: delete all points if the renderCircles property changes?
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
      .selectAll<SVGElement, utils.IPosition>('circle')
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
