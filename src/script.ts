import { Game } from "./game/Game";
import "./style.css";

(async () => {
  const gameContainer = document.getElementById(
    "game-container"
  ) as HTMLElement;
  const game = new Game();
  await game.initialise();

  game.mount(gameContainer);

  const startButton = document.getElementById("start") as HTMLButtonElement;
  const banner = document.getElementById("banner") as HTMLElement;

  startButton.addEventListener("click", () => {
    banner.remove();
    game.start();
  });
})();
