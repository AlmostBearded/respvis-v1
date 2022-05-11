import { SelectionOrTransition } from './selection';

export interface Size {
  width: number;
  height: number;
}

export function sizeRound(size: Size, decimals: number = 0): Size {
  const e = Math.pow(10, decimals);
  return {
    width: Math.round(size.width * e) / e,
    height: Math.round(size.height * e) / e,
  };
}

export function sizeEquals(a: Size, b: Size, epsilon: number = 0.001): boolean {
  return Math.abs(a.width - b.width) < epsilon && Math.abs(a.height - b.height) < epsilon;
}

export function sizeToString(size: Size, decimals: number = 1): string {
  size = sizeRound(size, decimals);
  return `${size.width}, ${size.height}`;
}

export function sizeFromString(str: string): Size {
  const parts = str.split(',').map((s) => parseFloat(s.trim()));
  return { width: parts[0], height: parts[1] };
}

export function sizeToAttrs(selectionOrTransition: SelectionOrTransition, size: Size): void {
  size = sizeRound(size);
  selectionOrTransition.attr('width', size.width).attr('height', size.height);
}

export function sizeFromAttrs(selectionOrTransition: SelectionOrTransition): Size {
  const s = selectionOrTransition.selection();
  return { width: parseFloat(s.attr('width') || '0'), height: parseFloat(s.attr('height') || '0') };
}
