class Point {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public static subtract(a: Point, b: Point): Point {
    return new Point(a.x - b.x, a.y - b.y);
  }

  public static add(a: Point, b: Point): Point {
    return new Point(a.x + b.x, a.y + b.y);
  }

  public static scale(point: Point, factor: number): Point {
    return new Point(point.x * factor, point.y * factor);
  }

  public add(point: Point): this {
    this.x += point.x;
    this.y += point.y;

    return this;
  }

  public round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  public scale(factor: number): this {
    this.x *= factor;
    this.y *= factor;

    return this;
  }

  public equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  public normalise(): this {
    return this.scale(1 / this.magnitude);
  }

  public get magnitude(): number {
    return Math.hypot(this.x, this.y);
  }
}

export { Point };
