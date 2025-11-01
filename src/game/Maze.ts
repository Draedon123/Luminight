import { OrderedSet } from "../utils/OrderedSet";
import { random } from "../utils/random";

type Tile = {
  x: number;
  y: number;
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

  public create(): void {
    this.tiles.splice(0, this.tiles.length);

    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        this.tiles.push({
          x,
          y,
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
        frontierTile.x + target.direction[0],
        frontierTile.y + target.direction[1]
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
  }

  public getTile(x: number, y: number): Tile {
    return this.tiles[this.getTileIndex(x, y)];
  }

  private getTileIndex(tile: Tile): number;
  private getTileIndex(x: number, y: number): number;
  private getTileIndex(x: number | Tile, y?: number): number {
    if (typeof x !== "number") {
      y = x.y;
      x = x.x;
    }

    return x + this.height * (y as number);
  }

  private getNeighbours(
    tile: Tile,
    distanceMultiplier: number = 1
  ): { tile: Tile; direction: number[] }[] {
    const directions = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ];

    return directions
      .map((direction) => {
        return {
          tile: this.getTile(
            tile.x + direction[0] * distanceMultiplier,
            tile.y + direction[1] * distanceMultiplier
          ),
          direction,
        };
      })
      .filter(
        (neighbour) =>
          neighbour.tile &&
          neighbour.tile.x > 0 &&
          neighbour.tile.y > 0 &&
          neighbour.tile.x < this.width - 1 &&
          neighbour.tile.y < this.height - 1
      );
  }

  *[Symbol.iterator](): Generator<Tile> {
    yield* this.tiles;
  }
}

export { Maze };
export type { Tile };
