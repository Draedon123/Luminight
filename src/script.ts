import { Game } from "./game/Game";
import "./style.scss";

(async () => {
  const gameContainer = document.getElementById(
    "game-container"
  ) as HTMLElement;
  const game = new Game();
  await game.initialise();

  game.mount(gameContainer);

  const startButton = document.getElementById("start") as HTMLButtonElement;
  const restartButton = document.getElementById("restart") as HTMLButtonElement;
  const tutorialScreen = document.getElementById("tutorial") as HTMLElement;
  const winScreen = document.getElementById("win") as HTMLElement;
  const loseScreen = document.getElementById("lose") as HTMLElement;
  const banner = document.getElementById("banner") as HTMLElement;

  tutorialScreen.classList.remove("hidden");

  game.onWin = () => {
    game.stop();
    banner.classList.remove("hidden");
    winScreen.classList.remove("hidden");
  };

  game.onLose = () => {
    game.stop();
    banner.classList.remove("hidden");
    loseScreen.classList.remove("hidden");
  };

  restartButton.addEventListener("click", () => {
    banner.classList.add("hidden");
    loseScreen.classList.add("hidden");
    game.reset();
    game.start();
  });

  startButton.addEventListener("click", () => {
    banner.classList.add("hidden");
    tutorialScreen.classList.add("hidden");
    game.start();
  });
})();
