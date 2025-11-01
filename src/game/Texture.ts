class Texture {
  public framesPerFrame: number;
  public currentFrame: number;

  private frame: number;
  private readonly frames: CanvasImageSource[];

  constructor(frames: CanvasImageSource[]) {
    this.frames = frames;
    this.currentFrame = 0;
    this.frame = 0;
    this.framesPerFrame = 1;
  }

  public get source(): CanvasImageSource {
    if (++this.frame % this.framesPerFrame === 0) {
      this.currentFrame++;
    }

    return this.frames[this.currentFrame % this.frames.length];
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
