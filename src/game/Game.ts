import { MazeRenderer } from "./MazeRenderer";
import { Maze } from "./Maze";
import { Player } from "./Player";
import { FrameData, Loop } from "../utils/Loop";
import { KeyboardManager } from "../utils/KeyboardManager";
import { Portal } from "./entities/Portal";
import { Enemy } from "./entities/Enemy";
import { Texture } from "./Texture";

const DEFAULT_KEYBINDS: GameOptions["keybinds"] = {
  FORWARD: "KeyW",
  LEFT: "KeyA",
  BACKWARDS: "KeyS",
  RIGHT: "KeyD",
};

const DEFAULT_MAZE: GameOptions["maze"] = {
  width: 20,
  height: 20,
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
  enemyCount: number;

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
  public enemyCount: number;

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
    this.playerAuraRadius = options.playerAuraRadius ?? 2;
    this.lightningDuration = options.lightningDuration_ms ?? 500;
    this.lightningRarity = options.lightningRarity ?? 25;
    this.lightningBrightness = options.lightningBrightness ?? 0.8;
    this.enemyCount = options.enemyCount ?? 5;

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

    await this.renderer.initialise();
    this.portal = await Portal.create();
    this.portal.randomisePosition(this.maze);

    this.portal.onCollision = () => {
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

    const ghostTexture = await Texture.create("/Luminight/ghost.png");

    const enemies = Array.from({ length: this.enemyCount }, () => {
      const enemy = new Enemy(ghostTexture, {
        movementSpeed: 0.8 * this.movementSpeed,
      });

      do {
        enemy.position.x = Math.floor(Math.random() * this.maze.width);
        enemy.position.y = Math.floor(Math.random() * this.maze.height);
      } while (
        (enemy.position.x < this.maze.width / 2 &&
          enemy.position.y < this.maze.height / 2) ||
        this.maze.getTile(enemy.position).isWall
      );

      enemy.onCollision = () => {
        this.onLose();
      };

      return enemy;
    });

    this.renderer.entities.push(this.portal, ...enemies);

    this.initialised = true;
  }

  public reset(): void {
    this.maze.create();

    for (const enemy of this.renderer.entities) {
      if (!(enemy instanceof Enemy)) {
        continue;
      }

      do {
        enemy.position.x = Math.floor(Math.random() * this.maze.width);
        enemy.position.y = Math.floor(Math.random() * this.maze.height);
      } while (
        (enemy.position.x < this.maze.width / 2 &&
          enemy.position.y < this.maze.height / 2) ||
        this.maze.getTile(enemy.position).isWall
      );

      enemy.reset();
    }

    this.portal.randomisePosition(this.maze);

    this.player.position.x = 1;
    this.player.position.y = 1;
    this.lightningCurrentLifetime = 0;

    this.renderer.reset();
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

    for (const entity of this.renderer.entities) {
      entity.checkCollisions(this.player);

      if (entity instanceof Enemy) {
        entity.tick(frame.deltaTime, this.maze);
      }
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
