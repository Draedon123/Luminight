import { Entity } from "./Entity";
import { Texture } from "../Texture";
import { Maze } from "../Maze";

class Portal extends Entity {
  constructor(texture: Texture) {
    super({ texture, size: 1 });
  }

  public static async create(): Promise<Portal> {
    const texture = await Texture.create(
      ...Array.from(
        { length: 32 },
        (_, i) =>
          "/Luminight/portal/" + (i + 1).toString().padStart(4, "0") + ".png"
      )
    );

    return new Portal(texture);
  }

  public randomisePosition(maze: Maze) {
    do {
      this.position.x = Math.floor(Math.random() * maze.width);
      this.position.y = Math.floor(Math.random() * maze.height);
    } while (
      maze.getTile(this.position).isWall ||
      // force the portal to spawn somewhere in the top-right corner
      this.position.x < maze.width / 1.5 ||
      this.position.y < maze.height / 1.5
    );
  }
}

export { Portal };
