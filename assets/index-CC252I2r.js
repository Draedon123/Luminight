var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}
class OrderedSet {
  constructor(maxLength = Infinity) {
    __publicField(this, "array");
    __publicField(this, "maxLength");
    this.array = [];
    this.maxLength = maxLength;
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.array.length; i++) {
      yield this.array[i];
    }
  }
  add(element) {
    if (this.array.includes(element) || this.array.length === this.maxLength) {
      return;
    }
    this.array.push(element);
  }
  remove(element) {
    const index = this.array.indexOf(element);
    if (index === -1) {
      return;
    }
    this.array.splice(index, 1);
  }
  get(index) {
    return this.array[index];
  }
  has(element) {
    return this.array.includes(element);
  }
  random() {
    return random(this.array);
  }
  indexOf(element) {
    return this.array.indexOf(element);
  }
  clear() {
    this.array.splice(0, this.size);
  }
  get size() {
    return this.array.length;
  }
}
class Maze {
  constructor(width, height) {
    __publicField(this, "width");
    __publicField(this, "height");
    __publicField(this, "tiles");
    this.tiles = [];
    this.width = width % 2 === 0 ? width + 1 : width;
    this.height = height % 2 === 0 ? height + 1 : height;
  }
  create() {
    this.tiles.splice(0, this.tiles.length);
    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        this.tiles.push({
          x,
          y,
          isWall: true
        });
      }
    }
    const start = this.getTile(1, 1);
    const frontier = new OrderedSet();
    const inMaze = /* @__PURE__ */ new Set();
    start.isWall = false;
    inMaze.add(this.getTileIndex(start));
    frontier.add(this.getTile(3, 1));
    frontier.add(this.getTile(1, 3));
    while (frontier.size > 0) {
      const frontierTile = frontier.random();
      const frontierNeighbours = this.getNeighbours(frontierTile, 2);
      const target = random(
        frontierNeighbours.filter(
          (neighbour) => inMaze.has(this.getTileIndex(neighbour.tile))
        )
      );
      const wall = this.getTile(
        frontierTile.x + target.direction[0],
        frontierTile.y + target.direction[1]
      );
      inMaze.add(this.getTileIndex(frontierTile));
      wall.isWall = false;
      frontierTile.isWall = false;
      frontier.remove(frontierTile);
      for (const neighbour of frontierNeighbours) {
        if (neighbour.tile && !inMaze.has(this.getTileIndex(neighbour.tile))) {
          frontier.add(neighbour.tile);
        }
      }
    }
  }
  getTile(x, y) {
    return this.tiles[this.getTileIndex(x, y)];
  }
  getTileIndex(x, y) {
    if (typeof x !== "number") {
      y = x.y;
      x = x.x;
    }
    return x + this.height * y;
  }
  getNeighbours(tile, distanceMultiplier = 1) {
    const directions = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1]
    ];
    return directions.map((direction) => {
      return {
        tile: this.getTile(
          tile.x + direction[0] * distanceMultiplier,
          tile.y + direction[1] * distanceMultiplier
        ),
        direction
      };
    }).filter(
      (neighbour) => neighbour.tile && neighbour.tile.x > 0 && neighbour.tile.y > 0 && neighbour.tile.x < this.width - 1 && neighbour.tile.y < this.height - 1
    );
  }
  *[Symbol.iterator]() {
    yield* this.tiles;
  }
}
class MazeRenderer {
  constructor(canvas2, maze2) {
    __publicField(this, "maze");
    __publicField(this, "canvas");
    __publicField(this, "ctx");
    this.maze = maze2;
    this.canvas = canvas2;
    const ctx = canvas2.getContext("2d");
    if (ctx === null) {
      throw new Error("Could not get 2D Canvas Rendering Context");
    }
    this.ctx = ctx;
    new ResizeObserver((entries) => {
      const box = entries[0].devicePixelContentBoxSize[0];
      this.canvas.width = box.inlineSize;
      this.canvas.height = box.blockSize;
      this.render();
    }).observe(canvas2);
  }
  render() {
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const tileSize = Math.floor(
      0.95 * Math.min(
        this.canvas.width / this.maze.width,
        this.canvas.height / this.maze.height
      )
    );
    const cornerX = (this.canvas.width - tileSize * this.maze.width) / 2;
    const cornerY = (this.canvas.height - tileSize * this.maze.height) / 2;
    for (const tile of this.maze) {
      const x = tileSize * tile.x + cornerX;
      const y = tileSize * tile.y + cornerY;
      this.ctx.fillStyle = tile.isWall ? "#000" : "#fff";
      this.ctx.fillRect(x, y, tileSize, tileSize);
    }
  }
}
const canvas = document.getElementById("main");
const maze = new Maze(30, 30);
maze.create();
const renderer = new MazeRenderer(canvas, maze);
renderer.render();
