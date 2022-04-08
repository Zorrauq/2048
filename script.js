import Grid from "./Grid.js";
import Tile from "./Tile.js";

const gameBoard = document.getElementById("game-board");
let grid;

start();

function start() {
  grid = new Grid(gameBoard);
  grid.randomEmptyCell().tile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = new Tile(gameBoard);
  setupInput();
}

function setupInput() {
  window.addEventListener("keydown", handleInput, { once: true });
}

async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput();
        return;
      }
      await moveDown();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput();
        return;
      }
      await moveLeft();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput();
        return;
      }
      await moveRight();
      break;

    default:
      setupInput();
      return;
  }

  grid.cells.forEach((cell) => cell.mergeTiles());
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  if (isLose()) {
    newTile.waitForTransition(true).then(() => {
      alert("You lose !!");
      restart();
    });
    return;
  }
  setupInput();
}

function moveUp() {
  return slideTiles(grid.cellsByColumns);
}
function moveDown() {
  return slideTiles(grid.cellsByColumns.map((column) => [...column].reverse()));
}
function moveLeft() {
  return slideTiles(grid.cellsByRows);
}
function moveRight() {
  return slideTiles(grid.cellsByRows.map((row) => [...row].reverse()));
}
function slideTiles(cells) {
  return Promise.all(
    cells.flatMap((group) => {
      const promises = [];
      for (let i = 0; i < group.length; i++) {
        const cell = group[i];
        if (cell.tile == null) continue;
        let lastValidTile;
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j];
          if (!moveToCell.canAccept(cell.tile)) break;
          lastValidTile = moveToCell;
        }
        if (lastValidTile != null) {
          promises.push(cell.tile.waitForTransition());
          if (lastValidTile.tile != null) {
            lastValidTile.mergeTile = cell.tile;
          } else {
            lastValidTile.tile = cell.tile;
          }
          cell.tile = null;
        }
      }
      return promises;
    })
  );
}

function canMoveUp() {
  return canMove(grid.cellsByColumns);
}

function canMoveDown() {
  return canMove(grid.cellsByColumns.map((column) => [...column].reverse()));
}
function canMoveLeft() {
  return canMove(grid.cellsByRows);
}
function canMoveRight() {
  return canMove(grid.cellsByRows.map((row) => [...row].reverse()));
}

function canMove(cells) {
  return cells.some((group) => {
    return group.some((cell, index) => {
      if (index == 0) return false;
      if (cell.tile == null) return false;
      const moveToCell = group[index - 1];
      return moveToCell.canAccept(cell.tile);
    });
  });
}

function isLose() {
  return !canMoveDown() && !canMoveLeft() && !canMoveRight() && !canMoveUp();
}

function restart() {
  grid.remove();
  start();
}
