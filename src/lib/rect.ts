export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Rect implements IRect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static fromRect(rect: IRect) {
    return new Rect(rect.x, rect.y, rect.width, rect.height);
  }

  static fromString(str: string): IRect {
    const parts = str.split(',').map((s) => parseFloat(s.trim()));
    return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
  }

  toString(): string {
    return `${this.x}, ${this.y}, ${this.width}, ${this.height}`;
  }
}
