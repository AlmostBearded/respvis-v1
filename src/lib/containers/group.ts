import { Component, IComponent, IComponentConfig } from '../component';
import { Selection, BaseType, select, create } from 'd3-selection';
import { ILayout } from '../layout/layout';
import { setSingleCellGridPosition } from './nine-patch';
import { IChart } from '../chart/chart';

export interface IGroupConfig extends IComponentConfig {
  children: IComponent<IComponentConfig>[];
}

export interface IGroup extends IComponent<IGroupConfig> {}

export class Group extends Component<IGroupConfig> implements IGroup {
  constructor() {
    super(create<SVGElement>('svg:g'), {
      children: [],
      attributes: {
        'grid-template': 'auto / auto',
      },
      responsiveConfigs: [],
    });
  }

  protected _applyConfig(config: IGroupConfig): void {
    // TODO: Handle mounting/unmounting of children after group has been mounted
    this._config.children = this._config.children.sort(
      (a, b) => a.renderOrder() - b.renderOrder()
    );
  }

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    selection.append(() => this.selection().node());
    this.config().children.forEach((child) => child.mount(this.selection()));
    return this;
  }

  fitInLayout(layout: ILayout): this {
    this.config().children.forEach((child) => child.fitInLayout(layout));
    return this;
  }

  render(transitionDuration: number): this {
    this.config().children.forEach((child) => child.render(transitionDuration));
    return this;
  }

  renderOrder(): number {
    // TODO: This should probably configurable by the user
    return 0;
  }
}

export function group(): Group {
  return new Group();
}
