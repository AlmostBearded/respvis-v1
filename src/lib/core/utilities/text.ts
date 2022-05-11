import { SelectionOrTransition } from './selection';

export enum Orientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum VerticalAlignment {
  Top = 'top',
  Center = 'center',
  Bottom = 'bottom',
}

export enum HorizontalAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export function textAlignVertical(
  selection: SelectionOrTransition,
  align: VerticalAlignment
): void {
  selection.attr('data-align-v', align);
}

export function textAlignHorizontal(
  selection: SelectionOrTransition,
  align: HorizontalAlignment
): void {
  selection.attr('data-align-h', align);
}

export function textOrientation(selection: SelectionOrTransition, orientation: Orientation) :void {
  selection.attr('data-orientation', orientation);
}
