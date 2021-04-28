import chroma from 'chroma-js';

// todo: remove chroma dependency or find a way to optimize tree shaking
// chroma issue with tree shaking: https://github.com/gka/chroma.js/issues/138

export const COLORS_CATEGORICAL = [
  '#78b4c6',
  '#1c9820',
  '#ff0087',
  '#9bb64b',
  '#628df2',
  '#0db293',
  '#f14330',
  '#b8949e',
  '#e49c4f',
  '#a665e4',
];

export function brighten(hexColor: string, factor: number): string {
  return chroma.hex(hexColor).brighten(factor).hex();
}

export function darken(hexColor: string, factor: number): string {
  return chroma.hex(hexColor).darken(factor).hex();
}

export function desaturate(hexColor: string, factor: number): string {
  return chroma.hex(hexColor).desaturate(factor).hex();
}
