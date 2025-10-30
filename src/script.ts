import { Maze } from "./Maze";
import { Player } from "./Player";
import { MazeRenderer } from "./rendering/MazeRenderer";
import "./style.css";
import { Loop } from "./utils/Loop";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const maze = new Maze(30, 30);
maze.create();

const player = new Player(maze);
const renderer = new MazeRenderer(canvas, maze, player);
const loop = new Loop();

loop.addCallback((frame) => {
  player.rotation += 0.1 * frame.deltaTime;
  renderer.render();
});

loop.start();
