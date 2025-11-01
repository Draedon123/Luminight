import { Item } from "../Item";
import { Texture } from "../Texture";

class Portal extends Item {
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
}

export { Portal };
