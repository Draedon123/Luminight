import { Maze } from "./Maze";
import { MazeRenderer } from "./rendering/MazeRenderer";
import "./style.css";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const maze = new Maze(30, 30);
maze.create();

const renderer = new MazeRenderer(canvas, maze);

renderer.render();
