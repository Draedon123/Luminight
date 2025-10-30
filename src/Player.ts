import type { Maze } from "./Maze";
import { Point } from "./utils/Point";

class Player {
  public static readonly SIZE: number = 0.5;
  public maze: Maze;
  /** in terms of maze tiles */
  public position: Point;
  constructor(maze: Maze) {
    this.maze = maze;
    this.position = new Point(1, 1);
  }
}

export { Player };
