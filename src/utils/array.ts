function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function empty<T>(array: T[]): T[] {
  return array.splice(0, array.length);
}

export { random, empty };
