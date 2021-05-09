import {
  ScaleBand,
  ScaleContinuousNumeric,
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

export type ScaleContinuous<TRange, TOutput> =
  | ScaleContinuousNumeric<TRange, TOutput>
  | ScaleTime<TRange, TOutput>;

export type ScaleAny<TDomain extends string | number | Date, TRange, TOutput> =
  // continuous input and continuous output
  | ScaleContinuous<TRange, TOutput>
  // continuous input and discrete output
  | ScaleQuantize<TRange>
  | ScaleQuantile<TRange>
  | ScaleThreshold<TDomain, TRange>
  // discrete input and discrete output
  | ScaleOrdinal<TDomain, TRange>
  | ScaleBand<TDomain>
  | ScalePoint<TDomain>;
