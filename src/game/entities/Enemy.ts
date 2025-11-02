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

      const tileKey = key(tile.x, tile.y);
      distanceMap.set(tileKey, dist);
      previous.set(tileKey, null);
      queue.insert({ tile, distance: dist }, dist, tileKey);
    }

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

      for (const [x, y] of neighbours) {
        const neighbour = maze.getTile(x, y);
        if (neighbour === undefined) {
          continue;
        }

        if (neighbour.isWall) {
          continue;
        }

        const neighbourKey = key(x, y);
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

  public tick(deltaTime: number, maze: Maze): void {
    if (this.movementQueue.length === 0) {
      const moveTo = new Point(0, 0);

      while (maze.getTile(moveTo.x, moveTo.y).isWall) {
        moveTo.x = Math.floor(Math.random() * maze.width);
        moveTo.y = Math.floor(Math.random() * maze.height);
      }

      this.pathfind(moveTo, maze);
    }

    const target = this.movementQueue[0];

    let dx = target.x - this.position.x;
    let dy = target.y - this.position.y;

    if (Math.abs(dx) + Math.abs(dy) <= 1e-2) {
      this.movementQueue.shift();

      this.position.x = Math.round(this.position.x);
      this.position.y = Math.round(this.position.y);

      return;
    }

    const normalisation = (this.movementSpeed * deltaTime) / Math.hypot(dx, dy);

    dx *= normalisation;
    dy *= normalisation;

    this.position.x += dx;
    this.position.y += dy;
  }
}

export { Enemy };
