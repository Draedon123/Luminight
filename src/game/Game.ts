import { MazeRenderer } from "./MazeRenderer";
import { Maze } from "./Maze";
import { Player } from "./Player";
import { FrameData, Loop } from "../utils/Loop";
import { KeyboardManager } from "../utils/KeyboardManager";
import { Portal } from "./entities/Portal";

const DEFAULT_KEYBINDS: GameOptions["keybinds"] = {
  FORWARD: "KeyW",
  LEFT: "KeyA",
  BACKWARDS: "KeyS",
  RIGHT: "KeyD",
};

const DEFAULT_MAZE: GameOptions["maze"] = {
  width: 30,
  height: 30,
};

type GameOptions = {
  keybinds: {
    FORWARD: string;
    LEFT: string;
    BACKWARDS: string;
    RIGHT: string;
  };
  maze: {
    width: number;
    height: number;
  };
  flickerSpeed: number;
  flickerRadius: number;
  playerAuraRadius: number;
  lightningDuration_ms: number;
  lightningRarity: number;
  lightningBrightness: number;
  movementSpeed: number;

  onWin: () => unknown;
  onLose: () => unknown;
};

class Game {
  public readonly canvas: HTMLCanvasElement;

  private readonly maze: Maze;
  private readonly renderer: MazeRenderer;
  private readonly player: Player;
  private readonly loop: Loop;
  private readonly keyboardManager: KeyboardManager;
  private readonly keybinds: GameOptions["keybinds"];
  private readonly thunderAudio: HTMLAudioElement;

  private playerAuraRadius: number;

  public movementSpeed: number;
  public flickerSpeed: number;
  public flickerRadius: number;
  public lightningDuration: number;
  public lightningRarity: number;
  public lightningBrightness: number;

  public onWin: () => unknown;
  public onLose: () => unknown;

  private initialised: boolean;
  private portal!: Portal;
  private lightningCurrentLifetime: number;

  constructor(options: Partial<GameOptions> = {}) {
    this.canvas = document.createElement("canvas");
    this.maze = new Maze(
      options.maze?.width ?? DEFAULT_MAZE.width,
      options.maze?.height ?? DEFAULT_MAZE.height
    ).create();
    this.player = new Player(this.maze);
    this.renderer = new MazeRenderer(this.canvas, this.maze, this.player);
    this.loop = new Loop();
    this.keybinds = options.keybinds ?? DEFAULT_KEYBINDS;
    this.keyboardManager = new KeyboardManager(
      Object.values(this.keybinds)
    ).addEventListeners();

    this.movementSpeed = options.movementSpeed ?? 0.0025;
    this.flickerRadius = options.flickerRadius ?? 0.04;
    this.flickerSpeed = options.flickerSpeed ?? 1 / 160;
    this.playerAuraRadius = options.playerAuraRadius ?? 1.5;
    this.lightningDuration = options.lightningDuration_ms ?? 500;
    this.lightningRarity = options.lightningRarity ?? 25;
    this.lightningBrightness = options.lightningBrightness ?? 0.8;

    this.onWin = options.onWin ?? (() => {});
    this.onLose = options.onLose ?? (() => {});

    this.renderer.auraIntensity = 0;
    this.lightningCurrentLifetime = 0;

    this.thunderAudio = document.createElement("audio");
    this.thunderAudio.volume = 0.1;

    this.initialised = false;

    this.loop.addCallback(this.tick.bind(this));
  }

  public async initialise(): Promise<void> {
    if (this.initialised) {
      return;
    }

    this.portal = await Portal.create();
    this.portal.position = {
      x: this.maze.width - 2,
      y: this.maze.height - 2,
    };

    this.portal.onCollision = () => {
      this.stop();
      this.onWin();
    };

    await new Promise<void>((resolve, reject) => {
      const callback = () => {
        resolve();
        this.thunderAudio.removeEventListener("canplaythrough", callback);
      };

      this.thunderAudio.addEventListener("canplaythrough", callback);
      this.thunderAudio.onerror = reject;
      this.thunderAudio.src = "/Luminight/thunder.mp3";
    });

    this.thunderAudio.addEventListener("ended", () => {
      this.thunderAudio.pause();
    });

    this.renderer.items.push(this.portal);

    this.initialised = true;
  }

  public mount(parent: HTMLElement): void {
    if (this.canvas.parentElement !== null) {
      return;
    }

    parent.appendChild(this.canvas);
  }

  public start(): void {
    this.loop.start();
  }

  private tick(frame: FrameData): void {
    this.flicker(frame.frame, frame.deltaTime);
    this.lightningFlash(frame.deltaTime);
    this.checkKeyboard(frame.deltaTime);

    for (const item of this.renderer.items) {
      item.checkCollisions(this.player);
    }

    this.renderer.render();
  }

  private flicker(frame: number, deltaTime: number): void {
    this.renderer.playerAuraRadius =
      this.playerAuraRadius +
      this.flickerRadius * Math.cos(frame * deltaTime * this.flickerSpeed);
    this.renderer.auraIntensity = Math.min(
      Math.max(0.2, this.renderer.auraIntensity + 0.15 * (Math.random() - 0.5)),
      1
    );
  }

  private checkKeyboard(deltaTime: number): void {
    if (this.keyboardManager.isKeyDown(this.keybinds.FORWARD)) {
      this.player.moveY(this.movementSpeed * deltaTime);
    }

    if (this.keyboardManager.isKeyDown(this.keybinds.BACKWARDS)) {
      this.player.moveY(-this.movementSpeed * deltaTime);
    }

    if (this.keyboardManager.isKeyDown(this.keybinds.LEFT)) {
      this.player.moveX(-this.movementSpeed * deltaTime);
    }

    if (this.keyboardManager.isKeyDown(this.keybinds.RIGHT)) {
      this.player.moveX(this.movementSpeed * deltaTime);
    }
  }

  private lightningFlash(deltaTime: number): void {
    this.renderer.maskAlpha =
      1 -
      (this.lightningBrightness * this.lightningCurrentLifetime) /
        this.lightningDuration;

    this.lightningCurrentLifetime = Math.max(
      this.lightningCurrentLifetime - deltaTime,
      0
    );

    const probability = 1 / (this.lightningRarity * deltaTime);
    if (Math.random() > probability) {
      return;
    }

    if (this.thunderAudio.paused) {
      this.thunderAudio.play();
    } else {
      // ensure the audio can overlap with itself
      const audio = this.thunderAudio.cloneNode() as HTMLAudioElement;
      audio.volume = 0.1;
      audio.play();
    }

    this.lightningCurrentLifetime = this.lightningDuration;
  }

  public stop(): void {
    this.loop.stop();
  }
}

export { Game };
