import chroma from 'chroma-js';
export { chroma };

export * as colors from './colors';

export { chart, Chart, IChart } from './chart';
export { computeLayout, applyLayoutTransforms, ILayoutStyle } from './layout/layout';
export { group, Group, IGroup, IGroupConfig } from './components/group';
export { text, Text, IText, titleAttributes, verticalTextAttributes } from './components/text';
export { rect, Rect, IRect, IRectConfig } from './components/rect';
export { bars, BarsComponent, IBarsComponent } from './components/bars/bars';
export { groupedBars, GroupedBarsComponent, IGroupedBarsComponent } from './components/bars/grouped-bars';

export {
  axis,
  leftAxis,
  bottomAxis,
  rightAxis,
  topAxis,
  Axis,
  IAxis,
  IAxisConfig,
} from './components/axis';

export {
  ticks,
  leftTicks,
  bottomTicks,
  rightTicks,
  topTicks,
  Ticks,
  ITicks,
  Position,
} from './components/ticks';

export {
  barLabels,
  renderBarLabels,
  BarLabelsComponent,
  IBarLabelsComponent,
  IBarLabelsConfig,
} from './components/bars/bar-labels';

export { legend, Legend, ILegend } from './legend/legend';

export {
  barPositioner,
  IBarPositioner,
  BarPositioner,
  Orientation as BarOrientation,
} from './components/bars/bar-positioner';

export {
  groupedBarPositioner,
  IGroupedBarPositioner,
  GroupedBarPositioner,
} from './components/bars/grouped-bar-positioner';

export {
  barPointPositioner,
  BarPointPositioner,
  HorizontalPosition,
  VerticalPosition,
  IBarPointPositioner,
} from './components/bars/bar-point-positioner';
