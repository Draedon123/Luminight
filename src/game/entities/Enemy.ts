import { MinPriorityQueue } from "src/utils/MinPriorityQueue";
import { empty } from "../../utils/array";
import { Point } from "../../utils/Point";
import { Collidable } from "../Collidable";
import { Maze, Tile } from "../Maze";
import { Texture } from "../Texture";

type EnemyOptions = {
  movementSpeed: number;
};

class Enemy extends Collidable {
  public movementSpeed: number;

  private movementQueue: Point[];

  constructor(texture: Texture, options: EnemyOptions) {
    super({ texture });

    this.movementSpeed = options.movementSpeed;
    this.movementQueue = [];
  }

  public pathfind(target: Point, maze: Maze) {
    empty(this.movementQueue);

    const queue = new MinPriorityQueue<{ tile: Tile; distance: number }>();
    const distanceMap = new Map<string, number>();
    const previous = new Map<string, Tile | null>();
    const visited = new Set<string>();

    const key = (x: number, y: number) => `${x},${y}`;

    for (const tile of maze.tiles) {
      const dist =
        tile.x === this.position.x && tile.y === this.position.y ? 0 : Infinity;
      distanceMap.set(key(tile.x, tile.y), dist);
      previous.set(key(tile.x, tile.y), null);
      queue.insert({ tile, distance: dist }, dist);
    }

    // Dijkstra’s main loop
    while (!queue.isEmpty()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const min = queue.extractMin()!;
      const current = min.value.tile;
      const currentKey = key(current.x, current.y);

      if (visited.has(currentKey)) {
        continue;
      }
      visited.add(currentKey);

      if (current.x === target.x && current.y === target.y) {
        break;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentDist = distanceMap.get(currentKey)!;

      const neighbours = [
        [current.x + 1, current.y],
        [current.x - 1, current.y],
        [current.x, current.y + 1],
        [current.x, current.y - 1],
      ];

      for (const [nx, ny] of neighbours) {
        const neighbor = maze.getTile(nx, ny);
        if (neighbor === undefined) {
          continue;
        }

        if (neighbor.isWall) {
          continue;
        }

        const neighborKey = key(nx, ny);
        const alt = currentDist + 1;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (alt < distanceMap.get(neighborKey)!) {
          distanceMap.set(neighborKey, alt);
          previous.set(neighborKey, current);
          queue.decreasePriority({ tile: neighbor, distance: alt }, alt);
        }
      }
    }

    const path: Tile[] = [];
    let current = maze.getTile(target.x, target.y) || null;

    while (current) {
      path.unshift(current);

      const prev = previous.get(key(current.x, current.y));

      if (!prev) {
        break;
      }

      current = prev;
    }

    for (const tile of path) {
      this.movementQueue.push(tile);
    }
  }

  public tick(deltaTime: number): void {
    if (this.movementQueue.length === 0) {
      return;
    }

    const target = this.movementQueue[0];

    let dx = target.x - this.position.x;
    let dy = target.y - this.position.y;

    const normalisation = this.movementSpeed * deltaTime * Math.hypot(dx, dy);

    dx *= normalisation;
    dy *= normalisation;

    this.position.x += dx;
    this.position.y += dy;

    if (this.position.x - target.x + this.position.y - target.y <= 1e-2) {
      this.movementQueue.shift();
    }
  }
}

export { Enemy };
