type QueueNode<T> = {
  value: T;
  priority: number;
  key: string;
};

class MinPriorityQueue<T> {
  private readonly data: QueueNode<T>[] = [];
  private readonly indexMap: Map<string, number> = new Map();

  private left(i: number): number {
    return 2 * i + 1;
  }

  private right(i: number): number {
    return 2 * i + 2;
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private swap(i: number, j: number): void {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];

    this.indexMap.set(this.data[i].key, i);
    this.indexMap.set(this.data[j].key, j);
  }

  public peek(): QueueNode<T> {
    return this.data[0];
  }

  public insert(value: T, priority: number, key: string): void {
    if (this.indexMap.has(key)) {
      this.decreasePriority(key, priority);
      return;
    }

    const node = { value, priority, key };
    this.data.push(node);

    const i = this.data.length - 1;
    this.indexMap.set(key, i);
    this.bubbleUp(i);
  }

  private bubbleUp(i: number): void {
    while (
      i > 0 &&
      this.data[this.parent(i)].priority > this.data[i].priority
    ) {
      const parent = this.parent(i);
      this.swap(i, parent);
      i = parent;
    }
  }

  public extractMin(): QueueNode<T> | null {
    if (this.data.length === 0) {
      return null;
    }

    const root = this.data[0];
    const last = this.data.pop() as QueueNode<T>;

    this.indexMap.delete(root.key);

    if (this.data.length > 0) {
      this.data[0] = last;
      this.indexMap.set(last.key, 0);
      this.minHeapify(0);
    }

    return root;
  }

  private minHeapify(i: number): void {
    const left = this.left(i);
    const right = this.right(i);

    let smallest = i;

    if (
      left < this.data.length &&
      this.data[left].priority < this.data[smallest].priority
    ) {
      smallest = left;
    }

    if (
      right < this.data.length &&
      this.data[right].priority < this.data[smallest].priority
    ) {
      smallest = right;
    }

    if (smallest !== i) {
      this.swap(i, smallest);
      this.minHeapify(smallest);
    }
  }

  public decreasePriority(key: string, newPriority: number): void {
    const i = this.indexMap.get(key);
    if (i === undefined) {
      return;
    }

    if (newPriority >= this.data[i].priority) {
      return;
    }

    this.data[i].priority = newPriority;
    this.bubbleUp(i);
  }

  public has(key: string): boolean {
    return this.indexMap.has(key);
  }

  public isEmpty(): boolean {
    return this.data.length === 0;
  }

  public size(): number {
    return this.data.length;
  }
}

export { MinPriorityQueue };
