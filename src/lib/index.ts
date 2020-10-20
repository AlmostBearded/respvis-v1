import chroma from 'chroma-js';
export { chroma };

export * as colors from './colors';

export { chart, Chart, IChart } from './chart/chart';
export { computeLayout, applyLayoutTransforms, ILayoutStyle } from './layout/layout';
export { group, Group, IGroup, IGroupConfig } from './components/group';
export { text, Text, IText, titleAttributes, verticalTextAttributes } from './components/text';
export { rect, Rect, IRect, IRectConfig } from './components/rect';
export { bars, BarsComponent, IBarsComponent } from './bars/bars';
export { groupedBars, GroupedBars, IGroupedBars } from './bars/grouped-bars';

export {
  axis,
  leftAxis,
  bottomAxis,
  rightAxis,
  topAxis,
  Axis,
  IAxis,
  IAxisConfig,
} from './axis/axis';

export {
  ticks,
  leftTicks,
  bottomTicks,
  rightTicks,
  topTicks,
  Ticks,
  ITicks,
  Position,
} from './axis/ticks';

export {
  barLabels,
  renderBarLabels,
  BarLabelsComponent,
  IBarLabelsComponent,
  IBarLabelsConfig,
} from './bars/bar-labels';

export { legend, Legend, ILegend } from './legend/legend';

export {
  barPositioner,
  IBarPositioner,
  BarPositioner,
  Orientation as BarOrientation,
} from './bars/bar-positioner';

export {
  groupedBarPositioner,
  IGroupedBarPositioner,
  GroupedBarPositioner,
} from './bars/grouped-bar-positioner';

export {
  barPointPositioner,
  BarPointPositioner,
  HorizontalPosition,
  VerticalPosition,
  IBarPointPositioner,
} from './bars/bar-point-positioner';
