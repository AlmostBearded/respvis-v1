import { Component } from '../component';
import {
  Point,
  PointPositioner,
  RectPointPositioner,
} from '../rect-point-positioner';
import { Selection, BaseType } from 'd3-selection';
import 'd3-transition';
import { Stringable } from '../utils';
import { Layout, layout } from '../layout/layout';

export interface Labels extends Component {
  pointPositioner(
    pointPositioner?: PointPositioner<unknown>
  ): PointPositioner<unknown> | Labels;
  labels(labels?: Stringable[]): Stringable[] | Labels;
}

export function labels(): Labels {
  let _pointPositioner: PointPositioner<unknown>;
  let _labels: Stringable[] = [];
  let _render = (transitionDuration: number) => {};
  let _resize = (layout: Layout, transitionDuration: number) => {};

  const renderedLabels: Labels = function renderedLabels(
    selection: Selection<SVGElement, unknown, BaseType, unknown>
  ) {
    _render = function render(transitionDuration: number): void {
      renderLabels(
        labelsSelection,
        _pointPositioner.points(),
        _labels
      );
    };

    _resize = function resize(
      layout: Layout,
      transitionDuration: number
    ): void {
      var layoutRect = layout.layoutOfElement(labelsSelection.node()!)!;
      _pointPositioner.update(layoutRect);
      _render(transitionDuration);
    };

    const labelsSelection = selection.append('g').classed('labels', true);
    _render(0);
  };

  renderedLabels.pointPositioner = function pointPositioner(
    pointPositioner?: PointPositioner<unknown>
  ): PointPositioner<unknown> | Labels {
    if (!arguments.length) return _pointPositioner;
    console.assert(pointPositioner, 'Labels require a valid point positioner!');
    _pointPositioner = pointPositioner!;
    return renderedLabels;
  };

  renderedLabels.labels = function label(
    labels?: Stringable[]
  ): Stringable[] | Labels {
    if (!arguments.length) return _labels;
    _labels = labels || [];
    return renderedLabels;
  };

  renderedLabels.resize = function resize(
    layout: Layout,
    transitionDuration: number
  ): void {
    _resize(layout, transitionDuration);
  };

  renderedLabels.render = function render(transitionDuration: number): void {
    _render(transitionDuration);
  };

  return renderedLabels;
}

function renderLabels(
  selection: Selection<SVGElement, unknown, BaseType, unknown>,
  points: Point[],
  labels: Stringable[]
) {
  selection
    .selectAll('.label')
    .data(points)
    .join((enter) =>
      enter
        .append('g')
        .classed('label', true)
        .call((groupSelection) => groupSelection.append('text'))
    )
    .style('transform', (d) => `translate(${d.x}px, ${d.y}px)`)
    .select('text')
    .text((d, i) => labels[i].toString());

  // .selectAll('text')
  // .data(function(d, i) => [labels[i].toString()])
  // .duration(transitionDuration)
}
