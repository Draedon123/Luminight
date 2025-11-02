import { MinPriorityQueue } from "../../utils/MinPriorityQueue";
import { empty } from "../../utils/array";
import { Point } from "../../utils/Point";
import { Entity } from "./Entity";
import { Maze, Tile } from "../Maze";
import { Texture } from "../Texture";

type EnemyOptions = {
  movementSpeed: number;
};

class Enemy extends Entity {
  public movementSpeed: number;

  private movementQueue: Point[];

  constructor(texture: Texture, options: EnemyOptions) {
    super({ texture, size: 0.8 });

    this.movementSpeed = options.movementSpeed;
    this.hitboxMultiplier = 0.2;
    this.movementQueue = [];
  }

  public pathfind(target: Point, maze: Maze) {
    empty(this.movementQueue);

    const queue = new MinPriorityQueue<{ tile: Tile; distance: number }>();
    const distanceMap = new Map<string, number>();
    const previous = new Map<string, Tile | null>();
    const visited = new Set<string>();

    const key = (position: Point) => `${position.x},${position.y}`;

    for (const tile of maze) {
      const dist = tile.position.equals(this.position) ? 0 : Infinity;

      const tileKey = key(tile.position);
      distanceMap.set(tileKey, dist);
      previous.set(tileKey, null);
      queue.insert({ tile, distance: dist }, dist, tileKey);
    }

    while (!queue.isEmpty()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const min = queue.extractMin()!;
      const current = min.value.tile;
      const currentKey = key(current.position);

      if (visited.has(currentKey)) {
        continue;
      }
      visited.add(currentKey);

      if (current.position.equals(target)) {
        break;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const currentDist = distanceMap.get(currentKey)!;

      const neighbours = [
        [current.position.x + 1, current.position.y],
        [current.position.x - 1, current.position.y],
        [current.position.x, current.position.y + 1],
        [current.position.x, current.position.y - 1],
      ];

      for (const [x, y] of neighbours) {
        const neighbour = maze.getTile(x, y);
        if (neighbour === undefined) {
          continue;
        }

        if (neighbour.isWall) {
          continue;
        }

        const neighbourKey = key(neighbour.position);
        const alt = currentDist + 1;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (alt < distanceMap.get(neighbourKey)!) {
          distanceMap.set(neighbourKey, alt);
          previous.set(neighbourKey, current);
          queue.decreasePriority(neighbourKey, alt);
        }
      }
    }

    const path: Tile[] = [];
    let current = maze.getTile(target) || null;

    while (current) {
      path.unshift(current);

      const prev = previous.get(key(current.position));

      if (!prev) {
        break;
      }

      current = prev;
    }

    for (const tile of path) {
      this.movementQueue.push(tile.position);
    }
  }

  public tick(deltaTime: number, maze: Maze): void {
    if (this.movementQueue.length === 0) {
      const moveTo = new Point(0, 0);

      while (maze.getTile(moveTo).isWall && !moveTo.equals(this.position)) {
        moveTo.x = Math.floor(Math.random() * maze.width);
        moveTo.y = Math.floor(Math.random() * maze.height);
      }

      this.pathfind(moveTo, maze);
    }

    const target = this.movementQueue[0];
    const displacement = Point.subtract(target, this.position);

    if (Math.abs(displacement.x) + Math.abs(displacement.y) <= 1e-2) {
      this.movementQueue.shift();

      this.position.round();

      return;
    }

    displacement.normalise().scale(this.movementSpeed * deltaTime);

    this.position.add(displacement);
  }

  public reset(): void {
    empty(this.movementQueue);
  }
}

export { Enemy };
