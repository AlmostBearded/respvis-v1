export interface Rect<T extends number | string> {
  x: T;
  y: T;
  width: T;
  height: T;
}

export function rectFromString(str: string): Rect<number> {
  const parts = str.split(',').map((s) => parseFloat(s.trim()));
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

export function rectToString<T extends number | string>(rect: Rect<T>): string {
  return `${rect.x}, ${rect.y}, ${rect.width}, ${rect.height}`;
}
