export * from './colors';
export * as utils from './utils';
// export * from './array';

import chroma from 'chroma-js';
export { chroma };

// export * as uuid from 'uuid';

// export * from './clip';
export * from './attributes';
export * from './scales';

export * from './component';
export * from './base-component';

export * from './components/svg-component';
export * from './components/group-component';
export * from './components/text-component';
export * from './components/rect-component';
export * from './components/grid-component';
export * from './components/padding-component';

export * from './utility/title-text-attributes';
export * from './utility/vertical-text-attributes';

export * from './chart';

// todo: solve Rect naming conflict (maybe namespaces?)
export * from './rect';

import { transition } from 'd3-transition';
import 'd3-transition';
