import { Component, IComponent, IComponentConfig } from '../component';
import {
  BarPointPositioner,
  HorizontalPosition,
  IBarPointPositioner,
  IBarPointPositionerConfig,
  IPoints,
  Position,
  VerticalPosition,
} from './bar-point-positioner';
import { IStringable, ISize, applyAttributes } from '../utils';
import { Selection, BaseType, create } from 'd3-selection';
import { IBarPositioner } from './bar-positioner';
import extend from 'extend';

export interface IBarLabelsConfig extends IComponentConfig, IBarPointPositionerConfig {
  labels: IStringable[];
  transitionDuration: number;
}

export interface IBarLabelsComponent extends IComponent<IBarLabelsConfig>, IPoints {}

export class BarLabelsComponent extends Component<IBarLabelsConfig> implements IBarLabelsComponent {
  private _barPointPositioner: IBarPointPositioner = new BarPointPositioner();

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
      },
      Component.mergeConfigs
    );
    this._applyConditionalConfigs();
  }

  protected _applyConfig(config: IBarLabelsConfig): void {
    this._barPointPositioner.config(config);
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    if (!this.activeConfig().bars)
      throw Error('Bar labels require an associated bars config property');

    selection.append(() => this.selection().node());

    // var boundingRect = selection.node()!.getBoundingClientRect();
    // this.fitInSize(boundingRect);

    this.render(false);

    return this;
  }

  protected _afterResize(): void {}

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
      .call(applyAttributes, this.activeConfig().attributes);
    return this;
  }

  renderOrder(): number {
    return 1;
  }

  points(): Position[] {
    return this._barPointPositioner.points();
  }
}

export function barLabels(): BarLabelsComponent {
  return new BarLabelsComponent();
}

export function renderBarLabels(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  points: Position[],
  labels: IStringable[],
  transitionDuration: number
): void {
  selection
    .selectAll<SVGGElement, Position>('.label')
    .data(points)
    .join((enter) =>
      enter
        .append('g')
        .classed('label', true)
        .call((groupSelection) => groupSelection.append('text'))
    )
    .transition()
    .duration(transitionDuration)
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    .select('text')
    .text((d, i) => labels[i].toString());
}
