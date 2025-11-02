type QueueNode<T> = {
  value: T;
  priority: number;
};

class MinPriorityQueue<T> {
  private readonly data: QueueNode<T>[];
  constructor() {
    this.data = [];
  }

  private left(i: number) {
    return 2 * i + 1;
  }

  private right(i: number) {
    return 2 * i + 2;
  }

  private parent(i: number) {
    return Math.floor((i - 1) / 2);
  }

  public peek() {
    return this.data[0];
  }

  public insert(value: QueueNode<T>) {
    this.data.push(value);

    let i = this.data.length - 1;
    while (i > 0 && this.data[this.parent(i)] > this.data[i]) {
      const parent = this.parent(i);
      [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
      i = parent;
    }
  }

  public extractMin() {
    if (this.data.length == 1) {
      return this.data.pop();
    }

    const min = this.data[0];

    this.data[0] = this.data[this.data.length - 1];
    this.data.pop();
    this.minHeapify(0);

    return min;
  }

  private minHeapify(root: number) {
    const length = this.data.length;

    if (length === 1) {
      return;
    }

    const left = this.left(root);
    const right = this.right(root);

    let smallest = root;

    if (left < length && this.data[left].priority < this.data[root].priority) {
      smallest = left;
    }
    if (
      right < length &&
      this.data[right].priority < this.data[smallest].priority
    ) {
      smallest = right;
    }

    if (smallest !== root) {
      [this.data[root], this.data[smallest]] = [
        this.data[smallest],
        this.data[root],
      ];

      this.minHeapify(smallest);
    }
  }
}

export { MinPriorityQueue };
