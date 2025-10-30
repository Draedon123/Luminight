import { Maze } from "./Maze";
import { Player } from "./Player";
import { MazeRenderer } from "./rendering/MazeRenderer";
import "./style.css";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const maze = new Maze(30, 30);
maze.create();

const player = new Player(maze);
const renderer = new MazeRenderer(canvas, maze, player);

renderer.render();
