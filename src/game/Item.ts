import { MazeRenderer } from "src/rendering/MazeRenderer";
import { Point } from "../utils/Point";
// import { Player } from "./Player";
import { Texture } from "./Texture";
import { Player } from "./Player";

type ItemOptions = {
  texture: Texture;
  size?: number;
  onCollision?: () => unknown;
};

class Item {
  public position: Point;
  public size: number;
  public onCollision: () => unknown;

  public readonly texture: Texture;
  constructor(options: ItemOptions) {
    this.position = new Point();
    this.size = options.size ?? 0.5;
    this.texture = options.texture;
    this.onCollision = options.onCollision ?? (() => {});
  }

  public checkCollisions(player: Player): void {
    const itemLeft = this.position.x + (1 - this.size) / 2;
    const itemRight = itemLeft + this.size;
    const itemBottom = this.position.y + (1 - this.size) / 2;
    const itemTop = itemBottom + this.size;

    const playerLeft = player.position.x + (1 - Player.SIZE) / 2;
    const playerRight = playerLeft + Player.SIZE;
    const playerBottom = player.position.y + (1 - Player.SIZE) / 2;
    const playerTop = playerBottom + Player.SIZE;

    const collided =
      itemLeft < playerRight &&
      itemRight > playerLeft &&
      itemBottom < playerTop &&
      itemTop > playerBottom;

    if (collided) {
      console.log("collided");
      this.onCollision();
    }
  }

  public render(renderer: MazeRenderer): void {
    const itemSize = renderer.getTileSize() * this.size;
    const renderPosition = renderer.getRenderPosition(this.position, this.size);

    renderer.ctx.drawImage(
      this.texture.source,
      renderPosition.x,
      renderPosition.y,
      itemSize,
      itemSize
    );
  }
}

export { Item };
