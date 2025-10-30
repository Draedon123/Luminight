import "./style.css";

const canvas = document.getElementById("main") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

ctx.fillStyle = "#f00";
ctx.fillRect(0, 0, canvas.width, canvas.height);
