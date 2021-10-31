import {
  scaleBand,
  ScaleBand,
  ScaleContinuousNumeric,
  scaleLinear,
  ScaleLinear,
  scaleLog,
  ScaleLogarithmic,
  ScaleOrdinal,
  ScalePoint,
  scalePow,
  ScalePower,
  ScaleQuantile,
  ScaleQuantize,
  scaleSqrt,
  ScaleThreshold,
  ScaleTime,
} from 'd3-scale';

export type ScaleContinuous<TRange, TOutput> =
  | ScaleContinuousNumeric<TRange, TOutput>
  | ScaleTime<TRange, TOutput>;

export type ScaleAny<TDomain extends string | number | Date, TRange, TOutput> =
  // continuous input and continuous output
  | ScaleLinear<TRange, TOutput>
  | ScaleLogarithmic<TRange, TOutput>
  | ScalePower<TRange, TOutput>
  | ScaleTime<TRange, TOutput>
  // continuous input and discrete output
  | ScaleQuantize<TRange>
  | ScaleQuantile<TRange>
  | ScaleThreshold<TDomain, TRange>
  // discrete input and discrete output
  | ScaleOrdinal<TDomain, TRange>
  | ScaleBand<TDomain>
  | ScalePoint<TDomain>;

// export interface ScaleBandConfig {
//   domain: string[];
//   padding?: number;
// }

// export function d3ScaleBand({ domain, padding }: ScaleBandConfig): ScaleBand<string> {
//   const scale = scaleBand();
//   scale.domain(domain);
//   if (padding) scale.padding(padding);
//   return scale;
// }

// export const ScaleContinuousTypes = ['linear', 'log', 'pow', 'sqrt'] as const;
// export type ScaleContinuousType = typeof ScaleContinuousTypes[number];

// export interface ScaleContinuousConfig {
//   type: ScaleContinuousType;
//   domain: (number | Date)[];
//   nice?: boolean | number;
// }

// export function d3ScaleContinuous({
//   type,
//   domain,
//   nice,
// }: ScaleContinuousConfig): ScaleContinuous<number | Date, number> {
//   let scale: ScaleContinuous<number | Date, number> | undefined;
//   switch (type) {
//     case 'linear':
//       scale = scaleLinear<number, number>();
//       break;
//     case 'log':
//       scale = scaleLog<number, number>();
//       break;
//     case 'pow':
//       scale = scalePow<number, number>();
//       break;
//     case 'sqrt':
//       scale = scaleSqrt<number, number>();
//       break;
//     default:
//       console.error(`Unknown continuous scale type '${type}'. Defaulting to linear scale.`);
//       scale = scaleLinear<number, number>();
//   }
//   scale!.domain(domain);
//   if (typeof nice === 'boolean' && 'nice' in scale!) scale.nice();
//   if (typeof nice === 'number' && 'nice' in scale!) scale.nice(nice);
//   return scale;
// }

// export interface ScaleConfig {
//   type: ScaleContinuousType | 'band';
//   domain: any[];
//   padding?: number;
//   nice?: boolean | number;
// }

// export function d3Scale(scaleConfig: ScaleConfig): ScaleAny<any, any, any> {
//   const { type, domain, padding, nice } = scaleConfig;
//   let scale: ScaleAny<any, any, any> | undefined;
//   if (type === 'linear' || type === 'log' || type === 'pow' || type === 'sqrt') {
//     scale = d3ScaleContinuous({ type, domain, nice });
//   }
//   ScaleContinuousTypes.forEach((t) => {
//     if (t === type) scale = d3ScaleContinuous(scaleConfig);
//   });
//   return scale;
// }
