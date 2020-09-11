import { IComponent } from '../component';
import {
  BarPointPositioner,
  HorizontalPosition,
  IBarPointPositioner,
  Point,
  VerticalPosition,
} from './bar-point-positioner';
import { IStringable, Size } from '../utils';
import { Selection, BaseType } from 'd3-selection';
import { ILayout } from '../layout/layout';
import { IBarPositioner } from './bar-positioner';

export interface IBarLabels extends IComponent, IBarPointPositioner {
  labels(labels?: IStringable[]): IStringable[] | this;
}

export class BarLabels implements IBarLabels {
  private _barPointPositioner: IBarPointPositioner = new BarPointPositioner();
  private _labels: IStringable[] = [];
  private _containerSelection: Selection<SVGGElement, unknown, BaseType, unknown>;
  private _labelsSelection: Selection<SVGGElement, unknown, BaseType, unknown>;

  constructor() {}

  // # IComponent

  mount(selection: Selection<SVGElement, unknown, BaseType, unknown>): this {
    this._containerSelection = selection
      .selectAll<SVGGElement, unknown>('.bars')
      .data([null])
      .join('g')
      .classed('bars', true);

    var boundingRect = selection.node()!.getBoundingClientRect();
    this.fitInSize(boundingRect);

    this.render(0);
    return this;
  }
  fitInLayout(layout: ILayout): this {
    var layoutRect = layout.layoutOfElement(this._containerSelection.node()!)!;
    this.fitInSize(layoutRect);
    return this;
  }
  render(transitionDuration: number): this {
    this._labelsSelection = renderBarLabels(this._containerSelection, this.points(), this._labels);
    return this;
  }

  // # IBarPointPositioner

  fitInSize(size: Size): this {
    this._barPointPositioner.fitInSize(size);
    return this;
  }
  points(): Point[] {
    return this._barPointPositioner.points();
  }
  bars(bars?: IBarPositioner): any {
    if (bars === undefined) return this._barPointPositioner.bars();
    this._barPointPositioner.bars(bars);
    return this;
  }
  horizontalPosition(position?: HorizontalPosition): any {
    if (position === undefined) return this._barPointPositioner.horizontalPosition();
    this._barPointPositioner.horizontalPosition(position);
    return this;
  }
  verticalPosition(position?: VerticalPosition): any {
    if (position === undefined) return this._barPointPositioner.verticalPosition();
    this._barPointPositioner.verticalPosition(position);
    return this;
  }

  // # IBarLabels

  labels(labels?: IStringable[]): IStringable[] | this {
    if (!arguments.length) return this._labels;
    this._labels = labels || [];
    return this;
  }
}

export function barLabels(): BarLabels {
  return new BarLabels();
}

export function renderBarLabels(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  points: Point[],
  labels: IStringable[]
): Selection<SVGGElement, unknown, BaseType, unknown> {
  return selection
    .selectAll<SVGGElement, Point>('.bar')
    .data(points)
    .join((enter) => enter.append('g').classed('bar', true))
    .call((s) =>
      s
        .selectAll<SVGGElement, Point>('.label')
        .data((d, i) => [{ point: d, label: labels[i] }])
        .join((enter) =>
          enter
            .append('g')
            .classed('label', true)
            .call((groupSelection) => groupSelection.append('text'))
        )
        .style('transform', (d) => `translate(${d.point.x}px, ${d.point.y}px)`)
        .call((s) => s.select('text').text((d) => d.label.toString()))
        .raise()
    );
}
