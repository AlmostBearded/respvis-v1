import { Component, nullComponent } from '../component';
import { nullFunction } from '../utils';
import { select, Selection } from 'd3-selection';
import debounce from 'debounce';
import { Layout, layout } from '../layout/layout';

export interface Chart {
  (containerSelector: string): void;
}

export function chart(): (containerSelector: string) => void {
  let _layout: Layout;
  let _updateLayout = nullFunction;

  function renderedChart(containerSelector: string) {
    const selection = select(containerSelector)
      .append('svg')
      .classed('chart', true);
    _layout(selection);

    resize();

    var resizing = false;
    var resizeIntervalHandle: number;
    window.addEventListener('resize', function () {
      if (!resizing) {
        resizing = true;
        resizeIntervalHandle = window.setInterval(resize, 10);
      }
    });

    window.addEventListener(
      'resize',
      debounce(function () {
        resizing = false;
        window.clearInterval(resizeIntervalHandle);
        _layout.transition();
      }, 1000)
    );

    selection.node()!.addEventListener('transitionstart', function (e) {
      // console.log(`transitionstart`);
      // console.log(e.target);
      select(e.target as HTMLElement).classed('transition', true);
    });

    selection.node()!.addEventListener('transitionend', function (e) {
      // console.log(`transitionend`);
      // console.log(e.target);
      select(e.target as HTMLElement).classed('transition', false);
    });

    function resize() {
      const boundingRect = selection.node()!.getBoundingClientRect();
      selection.attr(
        'viewBox',
        `0, 0, ${boundingRect.width}, ${boundingRect.height}`
      );
      _layout.resize();
    }

    _updateLayout = function (): void {};
  }

  renderedChart.layout = function layout(layout?: Layout): Layout | Chart {
    if (!arguments.length) return _layout;
    console.assert(layout, 'Cannot set layout to an undefined value');
    _layout = layout!;
    _updateLayout();
    return renderedChart;
  };

  return renderedChart;
}
