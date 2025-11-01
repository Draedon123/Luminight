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
  const tutorialScreen = document.getElementById("tutorial") as HTMLElement;
  const winScreen = document.getElementById("win") as HTMLElement;
  const banner = document.getElementById("banner") as HTMLElement;

  tutorialScreen.classList.remove("hidden");

  game.onWin = () => {
    banner.classList.remove("hidden");
    winScreen.classList.remove("hidden");
  };

  startButton.addEventListener("click", () => {
    banner.classList.add("hidden");
    tutorialScreen.classList.add("hidden");
    game.start();
  });
})();
