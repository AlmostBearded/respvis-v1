import {
  Component,
  IComponent,
  IComponentConfig,
  IComponentEventData,
  utils,
  chainedTransition,
} from '../core';
import {
  BarPointPositioner,
  HorizontalPosition,
  IBarPointPositioner,
  IBarPointPositionerConfig,
  IPoints,
  VerticalPosition,
} from './bar-point-positioner';
import { Selection, BaseType, create } from 'd3-selection';
import { IBarPositioner } from './bar-positioner';
import { active } from 'd3-transition';

export interface IBarLabelsConfig extends IComponentConfig, IBarPointPositionerConfig {
  labels: utils.IStringable[];
  transitionDuration: number;
  events: {
    typenames: string;
    callback: (event: Event, data: IBarLabelsEventData) => void;
  }[];
}

export interface IBarLabelsEventData extends IComponentEventData {
  labelIndex: number;
}

export interface IBarLabelsComponent extends IComponent<IBarLabelsConfig>, IPoints {}

export class BarLabelsComponent extends Component<IBarLabelsConfig> implements IBarLabelsComponent {
  private _barPointPositioner: IBarPointPositioner = new BarPointPositioner();

  static setEventListeners(component: BarLabelsComponent, config: IBarLabelsConfig) {
    config.events.forEach((eventConfig) =>
      component.selection().on(eventConfig.typenames, (e: Event) => {
        const textElement = e.target as SVGTextElement;
        const labelElement = textElement.parentNode!;
        const indexOf = Array.prototype.indexOf;
        const labelIndex = indexOf.call(labelElement.parentNode!.children, labelElement);
        eventConfig.callback(e, {
          component: component,
          labelIndex: labelIndex,
        });
      })
    );
  }

  constructor() {
    super(
      create<SVGElement>('svg:g').classed('labels', true),
      {
        labels: [],
        horizontalPosition: HorizontalPosition.Center,
        verticalPosition: VerticalPosition.Center,
        transitionDuration: 0,
        attributes: {
          text: {
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'font-weight': 'normal',
          },
        },
        conditionalConfigs: [],
        events: [],
        configParser: (previousConfig: IBarLabelsConfig, newConfig: IBarLabelsConfig) => {
          BarLabelsComponent.clearEventListeners(this, previousConfig);
          BarLabelsComponent.setEventListeners(this, newConfig);
          this._barPointPositioner.config(newConfig);
        },
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    if (!this.activeConfig().bars)
      throw Error('Bar labels require an associated bars config property');

    selection.append(() => this.selection().node());

    this.render(false);

    return this;
  }

  resize(): this {
    return this;
  }

  render(animated: boolean): this {
    this.selection()
      .call(
        renderBarLabels,
        this._barPointPositioner.points(),
        this.activeConfig().labels,
        animated ? this.activeConfig().transitionDuration : 0
      )
      .call(utils.applyAttributes, this.activeConfig().attributes);
    return this;
  }

  renderOrder(): number {
    return 1;
  }

  points(): utils.IPosition[] {
    return this._barPointPositioner.points();
  }
}

export function barLabels(): BarLabelsComponent {
  return new BarLabelsComponent();
}

export function renderBarLabels(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  points: utils.IPosition[],
  labels: utils.IStringable[],
  transitionDuration: number
): void {
  selection
    .selectAll<SVGGElement, utils.IPosition>('.label')
    .data(points)
    .join((enter) =>
      enter
        .append('g')
        .classed('label', true)
        .call((groupSelection) => groupSelection.append('text'))
    )
    .each((d, i, groups) => {
      chainedTransition(groups[i])
        .duration(transitionDuration)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
        .select('text')
        .text((d, i) => labels[i].toString());
    });
}
