import { MazeRenderer } from "src/rendering/MazeRenderer";
import { Point } from "../utils/Point";
// import { Player } from "./Player";
import { Texture } from "./Texture";

type ItemOptions = {
  texture: Texture;
  size?: number;
  onCollision?: () => unknown;
};

class Item {
  public position: Point;
  public size: number;
  public readonly texture: Texture;
  constructor(options: ItemOptions) {
    this.position = new Point();
    this.size = options.size ?? 0.5;
    this.texture = options.texture;
  }

  // public checkCollisions(player: Player): void {}

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
