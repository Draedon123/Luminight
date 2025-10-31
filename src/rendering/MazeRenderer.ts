import { Point } from "../utils/Point";
import type { Maze } from "../Maze";
import { Player } from "../Player";
// import { radians } from "../utils/angles";

const TWO_PI = Math.PI * 2;

class MazeRenderer {
  public maze: Maze;
  public player: Player;
  public playerAuraRadius: number;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly mask: HTMLCanvasElement;
  private readonly maskCTX: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement, maze: Maze, player: Player) {
    this.maze = maze;
    this.player = player;
    this.playerAuraRadius = 1.5;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mask = document.createElement("canvas");
    this.maskCTX = this.mask.getContext("2d") as CanvasRenderingContext2D;

    new ResizeObserver((entries) => {
      const box = entries[0].devicePixelContentBoxSize[0];

      const width = box.inlineSize;
      const height = box.blockSize;

      this.canvas.width = width;
      this.canvas.height = height;

      const tileSize = this.getTileSize();
      const mazeWidth = this.maze.width * tileSize;
      const mazeHeight = this.maze.height * tileSize;

      this.mask.width = mazeWidth;
      this.mask.height = mazeHeight;

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
    const tileSize = this.getTileSize();
    const corner = this.getMazeCorner();

    for (const tile of this.maze) {
      const x = tileSize * tile.x + corner.x;
      const y = tileSize * (this.maze.height - tile.y - 1) + corner.y;

      this.ctx.fillStyle = tile.isWall ? "#000" : "#fff";
      this.ctx.fillRect(x, y, tileSize, tileSize);
    }
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

    // const scaleX = 0.7;
    // const triangleX = playerRenderPosition.x + 0.5 * playerSize;

    // this.ctx.save();
    // this.ctx.translate(triangleX, playerRenderPosition.y + playerSize / 2);
    // this.ctx.rotate(radians(this.player.rotation));

    // this.ctx.beginPath();
    // this.ctx.moveTo((-scaleX * playerSize) / 2, playerSize / 2);
    // this.ctx.lineTo((scaleX * playerSize) / 2, playerSize / 2);
    // this.ctx.lineTo(0, -playerSize / 2);
    // this.ctx.lineTo((-scaleX * playerSize) / 2, playerSize / 2);
    // this.ctx.closePath();
    // this.ctx.fill();

    // this.ctx.restore();
  }

  private renderMask(): void {
    const mazeCorner = this.getMazeCorner();
    const tileSize = this.getTileSize();
    const auraRadius = this.playerAuraRadius * tileSize;
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

    this.maskCTX.restore();

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
