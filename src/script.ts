import "./style.css";
import { Maze } from "./game/Maze";
import { Player } from "./game/Player";
import { MazeRenderer } from "./rendering/MazeRenderer";
// import { radians } from "./utils/angles";
import { KeyboardManager } from "./utils/KeyboardManager";
import { Loop } from "./utils/Loop";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const maze = new Maze(30, 30);
maze.create();

const player = new Player(maze);
const renderer = new MazeRenderer(canvas, maze, player);
const loop = new Loop();

const KEYBINDS = {
  FORWARD: "KeyW",
  LEFT: "KeyA",
  BACKWARDS: "KeyS",
  RIGHT: "KeyD",
};

const keyboardManager = new KeyboardManager(Object.values(KEYBINDS));
keyboardManager.addEventListeners();

const movementSpeed = 0.0025;
const flickerRadius = 0.04;
const flickerSpeed = 1 / 160;
const playerAuraRadius = 1.5;

renderer.auraIntensity = 0.8;

loop.addCallback((frame) => {
  renderer.playerAuraRadius =
    playerAuraRadius +
    flickerRadius * Math.cos(frame.frame * frame.deltaTime * flickerSpeed);
  renderer.auraIntensity = Math.min(
    Math.max(0.2, renderer.auraIntensity + 0.15 * (Math.random() - 0.5)),
    1
  );

  if (keyboardManager.isKeyDown(KEYBINDS.FORWARD)) {
    player.moveY(movementSpeed * frame.deltaTime);
  }

  if (keyboardManager.isKeyDown(KEYBINDS.BACKWARDS)) {
    player.moveY(-movementSpeed * frame.deltaTime);
  }

  if (keyboardManager.isKeyDown(KEYBINDS.LEFT)) {
    player.moveX(-movementSpeed * frame.deltaTime);
  }

  if (keyboardManager.isKeyDown(KEYBINDS.RIGHT)) {
    player.moveX(movementSpeed * frame.deltaTime);
  }

  renderer.render();
});

loop.start();
