import "./style.css";
import { Maze } from "./Maze";
import { Player } from "./Player";
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
  // ROTATE_LEFT: "ArrowLeft",
  // ROTATE_RIGHT: "ArrowRight",
};

const keyboardManager = new KeyboardManager(Object.values(KEYBINDS));
keyboardManager.addEventListeners();

const movementSpeed = 0.0025;
// const rotationSpeed = 0.25;

loop.addCallback((frame) => {
  // const sine = Math.sin(radians(player.rotation));
  // const cosine = Math.cos(radians(player.rotation));

  // if (keyboardManager.isKeyDown(KEYBINDS.FORWARD)) {
  //   player.position.x += sine * movementSpeed * frame.deltaTime;
  //   player.position.y += cosine * movementSpeed * frame.deltaTime;
  // }

  // if (keyboardManager.isKeyDown(KEYBINDS.BACKWARDS)) {
  //   player.position.x -= sine * movementSpeed * frame.deltaTime;
  //   player.position.y -= cosine * movementSpeed * frame.deltaTime;
  // }

  // if (keyboardManager.isKeyDown(KEYBINDS.LEFT)) {
  //   player.position.x -= cosine * movementSpeed * frame.deltaTime;
  //   player.position.y += sine * movementSpeed * frame.deltaTime;
  // }

  // if (keyboardManager.isKeyDown(KEYBINDS.RIGHT)) {
  //   player.position.x += cosine * movementSpeed * frame.deltaTime;
  //   player.position.y -= sine * movementSpeed * frame.deltaTime;
  // }

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

  // if (keyboardManager.isKeyDown(KEYBINDS.ROTATE_RIGHT)) {
  //   player.rotation += rotationSpeed * frame.deltaTime;
  // }

  // if (keyboardManager.isKeyDown(KEYBINDS.ROTATE_LEFT)) {
  //   player.rotation -= rotationSpeed * frame.deltaTime;
  // }

  renderer.render();
});

loop.start();
