import { Point } from "../utils/Point";
import type { Maze } from "../game/Maze";
import { Player } from "../game/Player";

const TWO_PI = Math.PI * 2;

class MazeRenderer {
  public maze: Maze;
  public player: Player;
  public playerAuraRadius: number;
  public auraIntensity: number;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly mask: HTMLCanvasElement;
  private readonly maskCTX: CanvasRenderingContext2D;
  private readonly mazeCanvas: HTMLCanvasElement;
  private readonly mazeCTX: CanvasRenderingContext2D;

  private renderedMaze: boolean;

  constructor(canvas: HTMLCanvasElement, maze: Maze, player: Player) {
    this.maze = maze;
    this.player = player;
    this.playerAuraRadius = 1.5;
    this.auraIntensity = 1;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mask = document.createElement("canvas");
    this.maskCTX = this.mask.getContext("2d") as CanvasRenderingContext2D;
    this.mazeCanvas = document.createElement("canvas");
    this.mazeCTX = this.mazeCanvas.getContext("2d") as CanvasRenderingContext2D;
    this.renderedMaze = false;

    new ResizeObserver((entries) => {
      const box = entries[0].devicePixelContentBoxSize[0];

      const width = box.inlineSize;
      const height = box.blockSize;

      if (width === 0 || height === 0) {
        return;
      }

      this.canvas.width = width;
      this.canvas.height = height;

      const tileSize = this.getTileSize();
      const mazeWidth = this.maze.width * tileSize;
      const mazeHeight = this.maze.height * tileSize;

      this.mask.width = mazeWidth;
      this.mask.height = mazeHeight;
      this.mazeCanvas.width = mazeWidth;
      this.mazeCanvas.height = mazeHeight;

      this.renderedMaze = false;

      this.render();
    }).observe(canvas);
  }

  public render(): void {
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderMaze();
    this.renderPlayer();
    this.renderMask();
  }

  private renderMaze(): void {
    const corner = this.getMazeCorner();

    if (!this.renderedMaze) {
      const tileSize = this.getTileSize();

      this.mazeCTX.strokeStyle = "#000";

      for (const tile of this.maze) {
        const x = tileSize * tile.x;
        const y = tileSize * (this.maze.height - tile.y - 1);

        this.mazeCTX.fillStyle = tile.isWall ? "#000" : "#fff";
        this.mazeCTX.fillRect(x, y, tileSize, tileSize);
        this.mazeCTX.strokeRect(x, y, tileSize, tileSize);
      }

      this.renderedMaze = true;
    }

    this.ctx.drawImage(this.mazeCanvas, corner.x, corner.y);
  }

  private renderPlayer(): void {
    const tileSize = this.getTileSize();
    const playerSize = Player.SIZE * tileSize;
    const playerRenderPosition = this.getPlayerRenderPosition();

    this.ctx.fillStyle = "#f00";

    this.ctx.fillRect(
      playerRenderPosition.x,
      playerRenderPosition.y,
      playerSize,
      playerSize
    );
  }

  private renderMask(): void {
    const mazeCorner = this.getMazeCorner();
    const tileSize = this.getTileSize();
    const auraRadius = Math.floor(this.playerAuraRadius * tileSize);
    const playerRenderPosition = this.getPlayerRenderPosition();
    const playerSize = tileSize * Player.SIZE;

    this.maskCTX.fillStyle = "#222";
    this.maskCTX.fillRect(0, 0, this.mask.width, this.mask.height);

    const auraX = playerRenderPosition.x - mazeCorner.x + playerSize / 2;
    const auraY = playerRenderPosition.y - mazeCorner.y + playerSize / 2;

    this.maskCTX.beginPath();
    this.maskCTX.arc(auraX, auraY, auraRadius, 0, TWO_PI);
    this.maskCTX.closePath();

    this.maskCTX.save();
    this.maskCTX.clip();
    this.maskCTX.clearRect(
      auraX - auraRadius,
      auraY - auraRadius,
      auraRadius * 2,
      auraRadius * 2
    );

    const spotlight = this.maskCTX.createRadialGradient(
      auraX,
      auraY,
      auraRadius * 0.5,
      auraX,
      auraY,
      auraRadius
    );

    spotlight.addColorStop(0, "#0000");
    spotlight.addColorStop(0.7, "#1118");
    spotlight.addColorStop(1, "#222");

    this.maskCTX.fillStyle = spotlight;
    this.maskCTX.fill();

    this.maskCTX.fillStyle = `rgba(32, 32, 32, ${1 - this.auraIntensity})`;
    this.maskCTX.fill();

    this.maskCTX.restore();

    this.ctx.drawImage(this.mask, mazeCorner.x, mazeCorner.y);
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

  private getPlayerRenderPosition(): Point {
    const tileSize = this.getTileSize();
    const playerSize = Player.SIZE * tileSize;
    const corner = this.getMazeCorner();

    return new Point(
      corner.x +
        this.player.position.x * tileSize +
        0.5 * (tileSize - playerSize),
      corner.y +
        (this.maze.height - this.player.position.y - 1) * tileSize +
        0.5 * (tileSize - playerSize)
    );
  }
}

export { MazeRenderer };
