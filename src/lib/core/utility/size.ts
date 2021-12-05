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

export function sizeToAttrs(selectionOrTransition: SelectionOrTransition, size: Size): void {
  size = sizeRound(size);
  selectionOrTransition.attr('width', size.width).attr('height', size.height);
}
