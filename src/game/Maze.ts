import { Point } from "../utils/Point";
import { OrderedSet } from "../utils/OrderedSet";
import { empty, random } from "../utils/array";

type Tile = {
  position: Point;
  isWall: boolean;
};

class Maze {
  public width: number;
  public height: number;

  private readonly tiles: Tile[];

  constructor(width: number, height: number) {
    this.tiles = [];
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
  }

  public create(): this {
    empty(this.tiles);

    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        this.tiles.push({
          position: new Point(x, y),
          isWall: true,
        });
      }
    }

    const start = this.getTile(1, 1);
    const frontier = new OrderedSet<Tile>();
    const inMaze: Set<number> = new Set();

    start.isWall = false;

    inMaze.add(this.getTileIndex(start));
    frontier.add(this.getTile(3, 1));
    frontier.add(this.getTile(1, 3));

    while (frontier.size > 0) {
      const frontierTile = frontier.random();
      const frontierNeighbours = this.getNeighbours(frontierTile, 2);

      const target = random(
        frontierNeighbours.filter((neighbour) =>
          inMaze.has(this.getTileIndex(neighbour.tile))
        )
      );
      const wall = this.getTile(
        Point.add(frontierTile.position, target.direction)
      ) as Tile;

      inMaze.add(this.getTileIndex(frontierTile));

      wall.isWall = false;
      frontierTile.isWall = false;

      frontier.remove(frontierTile);

      for (const neighbour of frontierNeighbours) {
        if (neighbour.tile && !inMaze.has(this.getTileIndex(neighbour.tile))) {
          frontier.add(neighbour.tile);
        }
      }
    }

    const wallDeletionChance = 0.01;
    for (const wall of this.tiles) {
      if (
        !wall.isWall ||
        Math.random() > wallDeletionChance ||
        wall.position.x === 0 ||
        wall.position.y === 0 ||
        wall.position.x === this.width - 1 ||
        wall.position.y === this.height - 1
      ) {
        continue;
      }

      wall.isWall = false;
    }

    return this;
  }

  public getTile(position: Point): Tile;
  public getTile(x: number, y: number): Tile;
  public getTile(x: number | Point, y?: number): Tile {
    if (x instanceof Point) {
      y = x.y;
      x = x.x;
    }

    return this.tiles[this.getTileIndex(x, y as number)];
  }

  private getTileIndex(tile: Tile): number;
  private getTileIndex(x: number, y: number): number;
  private getTileIndex(x: number | Tile, y?: number): number {
    if (typeof x !== "number") {
      y = x.position.y;
      x = x.position.x;
    }

    return x + this.height * (y as number);
  }

  private getNeighbours(
    tile: Tile,
    distanceMultiplier: number = 1
  ): { tile: Tile; direction: Point }[] {
    const directions = [
      new Point(1, 0),
      new Point(0, 1),
      new Point(-1, 0),
      new Point(0, -1),
    ];

    return directions
      .map((direction) => {
        return {
          tile: this.getTile(
            Point.add(tile.position, Point.scale(direction, distanceMultiplier))
          ),
          direction,
        };
      })
      .filter(
        (neighbour) =>
          neighbour.tile &&
          neighbour.tile.position.x > 0 &&
          neighbour.tile.position.y > 0 &&
          neighbour.tile.position.x < this.width - 1 &&
          neighbour.tile.position.y < this.height - 1
      );
  }

  *[Symbol.iterator](): Generator<Tile> {
    yield* this.tiles;
  }
}

export { Maze };
export type { Tile };
