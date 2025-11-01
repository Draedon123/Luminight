import { MazeRenderer } from "src/rendering/MazeRenderer";
import { Point } from "../utils/Point";
import { Player } from "./Player";

type ItemOptions = {
  texture: HTMLImageElement;
  size?: number;
  onCollision?: () => unknown;
};

class Item {
  public position: Point;
  public size: number;
  public readonly texture: HTMLImageElement;
  constructor(options: ItemOptions) {
    this.position = new Point();
    this.size = options.size ?? 0.5;
    this.texture = options.texture;
  }

  public checkCollisions(player: Player): void {}

  public render(renderer: MazeRenderer): void {
    const itemSize = renderer.getTileSize() * this.size;
    const renderPosition = renderer.getRenderPosition(this.position, this.size);

    renderer.ctx.drawImage(
      this.texture,
      renderPosition.x,
      renderPosition.y,
      itemSize,
      itemSize
    );
  }

  public static create(
    options: Omit<ItemOptions, "texture"> & { textureSrc: string }
  ): Promise<Item> {
    return new Promise<Item>((resolve, reject) => {
      const texture = new Image();

      texture.onload = () => {
        const item = new Item({
          texture,
          ...options,
        });

        resolve(item);
      };

      texture.onerror = reject;

      texture.src = options.textureSrc;
    });
  }
}

export { Item };
