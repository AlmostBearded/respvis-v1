import {
  Component,
  IComponent,
  IComponentConfig,
  IComponentEventData,
  utils,
  setUniformNestedAttributes,
  setAttributes,
  IAttributes,
  transitionAttributes,
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
  createLabels: (
    selection: Selection<BaseType, IAttributes, any, any>
  ) => Selection<SVGGElement, IAttributes, any, any>;
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
        createLabels: createLabels,
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
    selection.append(() => this.selection().node());
    return this;
  }

  render(animated: boolean): this {
    const config = this.activeConfig();

    const attributes: IAttributes[] = this._barPointPositioner
      .points()
      .map((point) => ({ transform: `translate(${point.x}, ${point.y})` }));

    const labelsSelection = this.selection()
      .selectAll('.label')
      .data(attributes)
      .join(config.createLabels);

    if (animated && config.transitionDuration > 0)
      labelsSelection.transition().duration(config.transitionDuration).call(transitionAttributes);
    else labelsSelection.call(setAttributes);

    this.selection()
      .selectAll('text')
      .data(config.labels)
      .text((d) => d.toString());

    this.selection().datum(config.attributes).call(setUniformNestedAttributes).datum(null);

    return this;
  }

  points(): utils.IPosition[] {
    return this._barPointPositioner.points();
  }
}

export function barLabels(): BarLabelsComponent {
  return new BarLabelsComponent();
}

export function createLabels(
  selection: Selection<BaseType, IAttributes, SVGElement, unknown>
): Selection<SVGGElement, IAttributes, SVGElement, unknown> {
  return selection
    .append('g')
    .classed('label', true)
    .call(setAttributes)
    .call((g) => g.append('text'));
}
