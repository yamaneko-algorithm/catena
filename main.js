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

let state = new State();
let playFlag = false; 
let playerFlag = false;
let selectedIndex = -1;
let level, sengo;

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
  for (let i = 0; i < 7; i++) {
    document.getElementById(`${state.pieces[i][0]}-${state.pieces[i][1]}-piece`).dataset.state = (i < 3) ? 1 : 2;
    document.getElementById(`${state.enemy_pieces[i][0]}-${state.enemy_pieces[i][1]}-piece`).dataset.state = (i < 3) ? 3 : 4;
  }
}

createBoard();

window.addEventListener('load', function () {
  // PLAY button
  let play = document.querySelector('.play');
  play.addEventListener('click', function () {
    if (!playFlag) {
      let sengoArr = document.getElementsByName('sengo');
      for (let i = 0; i < sengoArr.length; i++) {
        if (sengoArr.item(i).checked) {
          sengo = sengoArr.item(i).value;
        }
      }
      let levelArr = document.getElementsByName('level');
      for (let i = 0; i < levelArr.length; i++) {
        if (levelArr.item(i).checked) {
          level = levelArr.item(i).value;
        }
      }
      if (sengo == 1) {
        playerFlag = true;
      }
      else {
        state = new State(state.enemy_pieces, state.pieces, 1);  // 謎仕様
        state.turn -= 1; 
        cpu();
      }
      document.querySelector('.top-menu').style.pointerEvents = "none";
      playFlag = true;
    }
  });
  // RESET button
  let reset = document.querySelector('.reset');
  reset.addEventListener('click', function () {
    document.querySelector('.fin').style.display = "none";
    for (let i = 0; i < 7; i++) {
      document.getElementById(`${state.pieces[i][0]}-${state.pieces[i][1]}-piece`).dataset.state = '';
      document.getElementById(`${state.enemy_pieces[i][0]}-${state.enemy_pieces[i][1]}-piece`).dataset.state = '';
    }
    state = new State();
    document.querySelector('.turn').textContent = `1 turn`;
    for (let i = 0; i < 7; i++) {
      document.getElementById(`${state.pieces[i][0]}-${state.pieces[i][1]}-piece`).dataset.state = (i < 3) ? 1 : 2;
      document.getElementById(`${state.enemy_pieces[i][0]}-${state.enemy_pieces[i][1]}-piece`).dataset.state = (i < 3) ? 3 : 4;
    }
    document.querySelector('.top-menu').style.pointerEvents = "auto";
    playFlag = false;
  });
  // Close botton
  document.querySelector('.close-btn').addEventListener('click', function () {
    document.querySelector('.fin').style.display = "none";
  });
  // Hamburger menu
  let button = document.querySelector('.toggle-menu-button');
  let menu = document.querySelector('.header-site-menu');
  button.addEventListener('click', function () {
    menu.classList.toggle('is-show');
  });
});

function onClick([x, y]) {
  if (playerFlag) {
    if (myIndex(state.pieces, [x, y]) >= 0) {
      if (selectedIndex >= 0){
        if (selectedIndex == myIndex(state.pieces, [x, y])) {
          toggleMoveMass();  // remove
          selectedIndex = -1;
        }
        else {
          toggleMoveMass();  // remove
          selectedIndex = myIndex(state.pieces, [x, y]);
          toggleMoveMass();  // add
        }
      }
      else {
        selectedIndex = myIndex(state.pieces, [x, y]);
        toggleMoveMass();  // add
      }
    }
    else if (myIncludes(state.legalActions(), [selectedIndex, [x, y]])) {
      toggleMoveMass();  // remove
      movePiece([selectedIndex, [x, y]]);
      playerFlag = false;
      selectedIndex = -1;
      (state.isLose()) ? fin() : cpu();
    }
  }
}

function toggleMoveMass() {
  state.legalActions().forEach(action => {
    if (action[0] == selectedIndex) {
      document.getElementById(`${action[1][0]}-${action[1][1]}-hexagon`).classList.toggle("move-mass");
    }
  })
}

function movePiece([index, [x, y]]) {
  // if (index < 3) {
  //   console.log(state.log([index, [x, y]]));
  // }
  const piece = document.getElementById(`${state.pieces[index][0]}-${state.pieces[index][1]}-piece`);
  document.getElementById(`${x}-${y}-piece`).dataset.state = piece.dataset.state;
  piece.dataset.state = "";
  state = state.next([index, [x, y]]);
  document.querySelector('.turn').textContent = `${state.turn+1} turn`;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function cpu() {
  await sleep(1000);  // 1sプログラム停止
  // const action = state.randomAction();
  const action = alphabetaAction(state, level);
  movePiece(action);
  (state.isLose()) ? fin() : playerFlag = true;
}

function fin() {
  document.querySelector('.fin').style.display = "block";
  document.querySelector('.winner').textContent = ((state.turn+1)%2 == sengo-1) ? "YOU WIN!" : "CPU WIN";
}

const startTime = Date.now(); // 開始時間
const endTime = Date.now(); // 終了時間
console.log("time =", endTime - startTime);
