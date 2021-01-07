export interface IRect<T> {
  x: T;
  y: T;
  width: T;
  height: T;
}

export class Rect<T> implements IRect<T> {
  x: T;
  y: T;
  width: T;
  height: T;

  constructor(x: T, y: T, width: T, height: T) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static fromRect<T>(rect: IRect<T>) {
    return new Rect(rect.x, rect.y, rect.width, rect.height);
  }

  static fromString(str: string): IRect<number> {
    const parts = str.split(',').map((s) => parseFloat(s.trim()));
    return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
  }

  toString(): string {
    return `${this.x}, ${this.y}, ${this.width}, ${this.height}`;
  }
}
