import type { Maze } from "src/Maze";

class MazeRenderer {
  public maze: Maze;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement, maze: Maze) {
    this.maze = maze;
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

    const tileSize = Math.floor(
      0.95 *
        Math.min(
          this.canvas.width / this.maze.width,
          this.canvas.height / this.maze.height
        )
    );

    const cornerX = (this.canvas.width - tileSize * this.maze.width) / 2;
    const cornerY = (this.canvas.height - tileSize * this.maze.height) / 2;

    for (const tile of this.maze) {
      const x = tileSize * tile.x + cornerX;
      const y = tileSize * tile.y + cornerY;

      this.ctx.fillStyle = tile.isWall ? "#000" : "#fff";
      this.ctx.fillRect(x, y, tileSize, tileSize);
    }
  }
}

export { MazeRenderer };
