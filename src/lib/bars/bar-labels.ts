import {
  Component,
  IComponent,
  IComponentConfig,
  IComponentEventData,
  utils,
  chainedTransition,
  setUniformNestedAttributes,
  _setNestedAttributes,
} from '../core';
import {
  BarPointPositioner,
  HorizontalPosition,
  IBarPointPositioner,
  IBarPointPositionerConfig,
  VerticalPosition,
} from './bar-point-positioner';
import { Selection, BaseType, create } from 'd3-selection';
import { IPoints } from '../points';

export interface IBarLabelsConfig extends IComponentConfig, IBarPointPositionerConfig {
  labels: utils.IStringable[];
  transitionDuration: number;
  events: utils.IDictionary<(event: Event, data: IBarLabelsEventData) => void>;
}

export interface IBarLabelsEventData extends IComponentEventData {
  labelIndex: number;
}

export interface IBarLabelsComponent extends IComponent<IBarLabelsConfig>, IPoints {}

export class BarLabelsComponent extends Component<IBarLabelsConfig> implements IBarLabelsComponent {
  private _barPointPositioner: IBarPointPositioner = new BarPointPositioner();

  static setEventListeners(component: BarLabelsComponent, config: IBarLabelsConfig) {
    for (const typenames in config.events) {
      component.selection().on(typenames, (e: Event) => {
        const textElement = e.target as SVGTextElement;
        const labelElement = textElement.parentNode!;
        const indexOf = Array.prototype.indexOf;
        const labelIndex = indexOf.call(labelElement.parentNode!.children, labelElement);
        config.events[typenames](e, {
          component: component,
          labelIndex: labelIndex,
        });
      });
    }
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
        responsiveConfigs: {},
        events: {},
        parseConfig: (previousConfig: IBarLabelsConfig, newConfig: IBarLabelsConfig) => {},
        applyConfig: (previousConfig: IBarLabelsConfig, newConfig: IBarLabelsConfig) => {
          BarLabelsComponent.clearEventListeners(this, previousConfig);
          BarLabelsComponent.setEventListeners(this, newConfig);
          this._barPointPositioner.config(newConfig);
        },
      },
      Component.mergeConfigs
    );
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    if (!this.activeConfig().bars)
      throw Error('Bar labels require an associated bars config property');

    selection.append(() => this.selection().node());

    this.render(false);

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
      .datum(this.activeConfig().attributes)
      .call(setUniformNestedAttributes)
      .datum(null);
    return this;
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
        .attr('transform', `translate(${d.x}, ${d.y})`)
        .select('text')
        .text(labels[i].toString());
    });
}
