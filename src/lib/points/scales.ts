export interface IScale<TDomain, TRange, TOutput> {
  (value: TDomain): TOutput | undefined;
  domain(domain?: TDomain[]): this | TDomain[];
  range(range?: TRange[]): this | TRange[];
}

export interface IScaleConfig<TDomain, TRange, TOutput> {
  scale: IScale<TDomain, TRange, TOutput>;
  domain: TDomain[];
}

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
