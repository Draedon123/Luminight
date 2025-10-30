import { Point } from "../utils/Point";
import type { Maze } from "../Maze";
import { Player } from "../Player";

class MazeRenderer {
  public maze: Maze;
  public player: Player;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement, maze: Maze, player: Player) {
    this.maze = maze;
    this.player = player;
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      throw new Error("Could not get 2D Canvas Rendering Context");
    }

    this.ctx = ctx;

    new ResizeObserver((entries) => {
      const box = entries[0].devicePixelContentBoxSize[0];

      this.canvas.width = box.inlineSize;
      this.canvas.height = box.blockSize;

      this.render();
    }).observe(canvas);
  }

  public render(): void {
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderMaze();
    this.renderPlayer();
  }

  private renderMaze(): void {
    const tileSize = this.getTileSize();
    const corner = this.getMazeCorner();

    for (const tile of this.maze) {
      const x = tileSize * tile.x + corner.x;
      const y = tileSize * tile.y + corner.y;

      this.ctx.fillStyle = tile.isWall ? "#000" : "#fff";
      this.ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  private renderPlayer(): void {
    const tileSize = this.getTileSize();
    const playerSize = Player.SIZE * tileSize;
    const corner = this.getMazeCorner();

    const playerX =
      corner.x +
      this.player.position.x * tileSize +
      0.5 * (tileSize - playerSize);
    const playerY =
      corner.y +
      (this.maze.height - this.player.position.y - 1) * tileSize +
      0.5 * (tileSize - playerSize);

    this.ctx.fillStyle = "#f00";

    const scaleX = 0.7;
    const triangleX = playerX + 0.5 * playerSize;

    this.ctx.save();
    this.ctx.translate(triangleX, playerY + playerSize / 2);
    this.ctx.rotate((Math.PI * this.player.rotation) / 180);

    this.ctx.beginPath();
    this.ctx.moveTo((-scaleX * playerSize) / 2, playerSize / 2);
    this.ctx.lineTo((scaleX * playerSize) / 2, playerSize / 2);
    this.ctx.lineTo(0, -playerSize / 2);
    this.ctx.lineTo((-scaleX * playerSize) / 2, playerSize / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  private getTileSize(): number {
    return Math.floor(
      0.95 *
        Math.min(
          this.canvas.width / this.maze.width,
          this.canvas.height / this.maze.height
        )
    );
  }

  private getMazeCorner(): Point {
    const tileSize = this.getTileSize();

    return new Point(
      (this.canvas.width - tileSize * this.maze.width) / 2,
      (this.canvas.height - tileSize * this.maze.height) / 2
    );
  }
}

export { MazeRenderer };
