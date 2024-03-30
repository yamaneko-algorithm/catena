'use strict'

import { State } from './catena.js';
import { alphabetaAction } from './alphabeta.js';

function myIndex(arr, [x, y]) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][0] == x && arr[i][1] == y) {
      return i;
    }
  }
  return -1;
}
function myIncludes(arr, [index, [x, y]]) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][0] == index && arr[i][1][0] == x && arr[i][1][1] == y) {
      return true;
    }
  }
  return false;
}

// 盤面の作成
function createBoard() {
  const board = document.getElementById("board");
  const hexagonsTemplate = document.getElementById("hexagons-template");
  const hexagonTemplate = document.getElementById("hexagon-template");
  for (let y = 0; y <= 10; y++) {
    const hexagons = hexagonsTemplate.cloneNode();
    hexagons.id = "";
    const diff = Math.abs(5 - y);
    const corner = (y%5 == 0) ? 1 : 0;
    const start = (y < 5) ? corner : diff + corner;
    const end = (y < 5) ? 10 - diff -corner : 10 - corner;
    for (let x = start; x <= end ; x++) {
      const hexagon = hexagonTemplate.cloneNode(true);
      hexagon.id = `${x}-${y}-hexagon`;
      if (y == 0 || y == 10 || (x == start && y != 5) || (x == end && y != 5)) {
        hexagon.classList.add("gray");
      }
      hexagon.addEventListener('click', () => {
        onClick([x, y]);
      })
      const piece = hexagon.querySelector(".piece");
      piece.id = `${x}-${y}-piece`;
      hexagons.appendChild(hexagon);
    }
    board.appendChild(hexagons);
  }
}

createBoard();

let state = new State();
let playerFlag = true;
let selectedIndex = -1;

for (let i = 0; i < 7; i++) {
  document.getElementById(`${state.pieces[i][0]}-${state.pieces[i][1]}-piece`).dataset.state = (i < 3) ? 1 : 2;
  document.getElementById(`${state.enemy_pieces[i][0]}-${state.enemy_pieces[i][1]}-piece`).dataset.state = (i < 3) ? 3 : 4;
}

function onClick([x, y]) {
  if (playerFlag) {
    if (myIndex(state.pieces, [x, y]) >= 0) {
      selectedIndex = myIndex(state.pieces, [x, y]);
    }
    else if (myIncludes(state.legalActions(), [selectedIndex, [x, y]])) {
      movePiece([selectedIndex, [x, y]]);
      playerFlag = false;
      selectedIndex = -1;
      (state.isLose()) ? fin() : cpu();
    }
  }
}

function movePiece([index, [x, y]]) {
  const piece = document.getElementById(`${state.pieces[index][0]}-${state.pieces[index][1]}-piece`);
  document.getElementById(`${x}-${y}-piece`).dataset.state = piece.dataset.state;
  piece.dataset.state = "";
  state = state.next([index, [x, y]]);
}

function cpu() {
  // const action = state.randomAction();
  const action = alphabetaAction(state, 5);
  movePiece(action);
  (state.isLose()) ? fin() : playerFlag = true;
}

function fin() {

}

// toggle menu
window.addEventListener('load', function () {
  let button = document.querySelector('.toggle-menu-button');
  let menu = document.querySelector('.header-site-menu');
  button.addEventListener('click', function () {
    menu.classList.toggle('is-show');
  });
});

const startTime = Date.now(); // 開始時間
const endTime = Date.now(); // 終了時間
console.log("time =", endTime - startTime);
