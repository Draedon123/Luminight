import { empty, random } from "./array";

class OrderedSet<T> {
  private readonly array: T[];
  public readonly maxLength: number;
  constructor(maxLength: number = Infinity) {
    this.array = [];
    this.maxLength = maxLength;
  }

  *[Symbol.iterator](): Generator<T, void, unknown> {
    for (let i = 0; i < this.array.length; i++) {
      yield this.array[i];
    }
  }

  public add(element: T): void {
    if (this.array.includes(element) || this.array.length === this.maxLength) {
      return;
    }

    this.array.push(element);
  }

  public remove(element: T): void {
    const index = this.array.indexOf(element);

    if (index === -1) {
      return;
    }

    this.array.splice(index, 1);
  }

  public get(index: number): T {
    return this.array[index];
  }

  public has(element: T): boolean {
    return this.array.includes(element);
  }

  public random(): T {
    return random(this.array);
  }

  public indexOf(element: T): number {
    return this.array.indexOf(element);
  }

  public clear(): void {
    empty(this.array);
  }

  public get size(): number {
    return this.array.length;
  }
}

export { OrderedSet };
