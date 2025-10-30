import type { Maze } from "./Maze";
import { Point } from "./utils/Point";

class Player {
  public static readonly SIZE: number = 0.75;
  public maze: Maze;
  /** in terms of maze tiles */
  public position: Point;
  /** degrees */
  public rotation: number;
  /** degrees */
  public fov: number;
  constructor(maze: Maze) {
    this.maze = maze;
    this.position = new Point(1, 1);
    this.rotation = 0;
    this.fov = 45;
  }
}

export { Player };
