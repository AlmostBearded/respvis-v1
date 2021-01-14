import {
  ScaleBand,
  ScaleLinear,
  ScaleLogarithmic,
  ScaleOrdinal,
  ScalePoint,
  ScalePower,
  ScaleQuantile,
  ScaleQuantize,
  ScaleThreshold,
  ScaleTime,
} from 'd3-scale';

export type ScaleAny<TDomain extends string | number | Date, TRange, TOutput> =
  // continuous input and continuous output
  | ScaleLinear<TRange, TOutput>
  | ScalePower<TRange, TOutput>
  | ScaleLogarithmic<TRange, TOutput>
  | ScaleTime<TRange, TOutput>
  // continuous input and discrete output
  | ScaleQuantize<TRange>
  | ScaleQuantile<TRange>
  | ScaleThreshold<TDomain, TRange>
  // discrete input and discrete output
  | ScaleOrdinal<TDomain, TRange>
  | ScaleBand<TDomain>
  | ScalePoint<TDomain>;

export {
  // continuous input and continuous output
  scaleLinear as linearScale,
  scalePow as powScale,
  scaleSqrt as sqrtScale,
  scaleLog as logScale,
  scaleTime as timeScale,
  // continuous input and discrete output
  scaleQuantize as quantizeScale,
  scaleQuantile as quantileScale,
  scaleThreshold as thresholdScale,
  // discrete input and discrete output
  scaleOrdinal as ordinalScale,
  scaleBand as bandScale,
  scalePoint as pointScale,
} from 'd3-scale';
