import { Game } from "./game/Game";
import "./style.css";

const gameContainer = document.getElementById("game-container") as HTMLElement;
const game = new Game();

game.mount(gameContainer);
game.start();
