import type { Maze } from "./Maze";
import { Point } from "./utils/Point";

class Player {
  public static readonly SIZE: number = 0.5;
  public maze: Maze;
  /** in terms of maze tiles */
  public position: Point;
  /** degrees */
  // public rotation: number;
  /** degrees */
  public fov: number;
  constructor(maze: Maze) {
    this.maze = maze;
    this.position = new Point(1, 1);
    // this.rotation = 0;
    this.fov = 45;
  }

  public moveX(dx: number): void {
    this.move(dx, 0);
  }

  public moveY(dy: number): void {
    this.move(0, dy);
  }

  public move(dx: number, dy: number): void {
    const newX = this.position.x + dx;
    const newY = this.position.y + dy;

    const left = Math.floor(newX + Player.SIZE / 2);
    const right = Math.ceil(newX - Player.SIZE / 2);
    const top = Math.ceil(newY - Player.SIZE / 2);
    const bottom = Math.floor(newY + Player.SIZE / 2);

    if (
      (dx < 0 &&
        !this.maze.getTile(left, top)?.isWall &&
        !this.maze.getTile(left, bottom)?.isWall) ||
      (dx > 0 &&
        !this.maze.getTile(right, top)?.isWall &&
        !this.maze.getTile(right, bottom)?.isWall) ||
      dx === 0
    ) {
      this.position.x = newX;
    } else {
      this.position.x = Math.round(newX) + (Math.sign(dx) * Player.SIZE) / 2;
    }

    if (
      (dy < 0 &&
        !this.maze.getTile(left, bottom)?.isWall &&
        !this.maze.getTile(right, bottom)?.isWall) ||
      (dy > 0 &&
        !this.maze.getTile(left, top)?.isWall &&
        !this.maze.getTile(right, top)?.isWall) ||
      dy === 0
    ) {
      this.position.y = newY;
    } else {
      this.position.y = Math.round(newY) + (Math.sign(dy) * Player.SIZE) / 2;
    }
  }
}

export { Player };
