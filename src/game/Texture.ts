class Texture {
  private readonly frames: CanvasImageSource[];

  private frame: number;
  constructor(frames: CanvasImageSource[]) {
    this.frames = frames;
    this.frame = 0;
  }

  public get source(): CanvasImageSource {
    return this.frames[this.frame % this.frames.length];
  }

  public static async create(...sources: string[]): Promise<Texture> {
    const framePromises = sources.map(
      (source) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const frame = new Image();

          frame.onerror = reject;
          frame.onload = () => {
            resolve(frame);
          };

          frame.src = source;
        })
    );

    const frames = await Promise.all(framePromises);

    return new Texture(frames);
  }
}

export { Texture };
