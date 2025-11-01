import { MazeRenderer } from "../rendering/MazeRenderer";
import { Maze } from "./Maze";
import { Player } from "./Player";
import { Loop } from "../utils/Loop";
import { KeyboardManager } from "../utils/KeyboardManager";
import { Portal } from "./items/Portal";

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
  movementSpeed: number;
};

class Game {
  public readonly canvas: HTMLCanvasElement;

  private readonly maze: Maze;
  private readonly renderer: MazeRenderer;
  private readonly player: Player;
  private readonly loop: Loop;
  private readonly keyboardManager: KeyboardManager;
  private readonly keybinds: GameOptions["keybinds"];

  private playerAuraRadius: number;

  public movementSpeed: number;
  public flickerSpeed: number;
  public flickerRadius: number;

  private initialised: boolean;
  private portal!: Portal;

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

    this.initialised = false;

    this.loop.addCallback((frame) => {
      this.renderer.playerAuraRadius =
        this.playerAuraRadius +
        this.flickerRadius *
          Math.cos(frame.frame * frame.deltaTime * this.flickerSpeed);
      this.renderer.auraIntensity = Math.min(
        Math.max(
          0.2,
          this.renderer.auraIntensity + 0.15 * (Math.random() - 0.5)
        ),
        1
      );

      if (this.keyboardManager.isKeyDown(this.keybinds.FORWARD)) {
        this.player.moveY(this.movementSpeed * frame.deltaTime);
      }

      if (this.keyboardManager.isKeyDown(this.keybinds.BACKWARDS)) {
        this.player.moveY(-this.movementSpeed * frame.deltaTime);
      }

      if (this.keyboardManager.isKeyDown(this.keybinds.LEFT)) {
        this.player.moveX(-this.movementSpeed * frame.deltaTime);
      }

      if (this.keyboardManager.isKeyDown(this.keybinds.RIGHT)) {
        this.player.moveX(this.movementSpeed * frame.deltaTime);
      }

      this.renderer.render();
    });
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

  public stop(): void {
    this.loop.stop();
  }
}

export { Game };
