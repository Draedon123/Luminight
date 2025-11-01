import { Game } from "./game/Game";
import "./style.css";

(async () => {
  const gameContainer = document.getElementById(
    "game-container"
  ) as HTMLElement;
  const game = new Game();

  await game.initialise();

  game.mount(gameContainer);
  game.start();
})();
