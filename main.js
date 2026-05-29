'use strict';

import { State } from './catena.js';
import { alphabetaAction } from './alphabeta.js';

const PLAYER_KING = '1';
const PLAYER_STONE = '2';
const CPU_KING = '3';
const CPU_STONE = '4';
const CPU_DELAY_MS = 1000;

const board = document.getElementById('board');
const hexagonsTemplate = document.getElementById('hexagons-template');
const hexagonTemplate = document.getElementById('hexagon-template');
const topMenu = document.querySelector('.top-menu');
const turnText = document.querySelector('.turn');
const finishDialog = document.querySelector('.fin');
const winnerText = document.querySelector('.winner');

function findPositionIndex(arr, [x, y]) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][0] === x && arr[i][1] === y) {
      return i;
    }
  }
  return -1;
}

function includesAction(arr, [index, [x, y]]) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][0] === index && arr[i][1][0] === x && arr[i][1][1] === y) {
      return true;
    }
  }
  return false;
}

function pieceElement([x, y]) {
  return document.getElementById(`${x}-${y}-piece`);
}

function hexagonElement([x, y]) {
  return document.getElementById(`${x}-${y}-hexagon`);
}

function setPieces() {
  for (let i = 0; i < 7; i++) {
    pieceElement(state.pieces[i]).dataset.state = (i < 3) ? PLAYER_KING : PLAYER_STONE;
    pieceElement(state.enemy_pieces[i]).dataset.state = (i < 3) ? CPU_KING : CPU_STONE;
  }
}

function clearPieces() {
  for (let i = 0; i < 7; i++) {
    pieceElement(state.pieces[i]).dataset.state = '';
    pieceElement(state.enemy_pieces[i]).dataset.state = '';
  }
}

let state = new State();
let playFlag = false; 
let playerFlag = false;
let selectedIndex = -1;
let level;
let sengo;

// 盤面の作成
function createBoard() {
  for (let y = 0; y <= 10; y++) {
    const hexagons = hexagonsTemplate.cloneNode();
    hexagons.id = '';
    const diff = Math.abs(5 - y);
    const corner = (y % 5 === 0) ? 1 : 0;
    const start = (y < 5) ? corner : diff + corner;
    const end = (y < 5) ? 10 - diff - corner : 10 - corner;
    for (let x = start; x <= end; x++) {
      const hexagon = hexagonTemplate.cloneNode(true);
      hexagon.id = `${x}-${y}-hexagon`;
      if (y === 0 || y === 10 || (x === start && y !== 5) || (x === end && y !== 5)) {
        hexagon.classList.add('gray');
      }
      hexagon.addEventListener('click', () => {
        onClick([x, y]);
      });
      const piece = hexagon.querySelector('.piece');
      piece.id = `${x}-${y}-piece`;
      hexagons.appendChild(hexagon);
    }
    board.appendChild(hexagons);
  }
  setPieces();
}

createBoard();

window.addEventListener('load', function () {
  // PLAY button
  const play = document.querySelector('.play');
  play.addEventListener('click', function () {
    if (!playFlag) {
      const sengoArr = document.getElementsByName('sengo');
      for (let i = 0; i < sengoArr.length; i++) {
        if (sengoArr.item(i).checked) {
          sengo = sengoArr.item(i).value;
        }
      }
      const levelArr = document.getElementsByName('level');
      for (let i = 0; i < levelArr.length; i++) {
        if (levelArr.item(i).checked) {
          level = levelArr.item(i).value;
        }
      }
      if (sengo === '1') {
        playerFlag = true;
      }
      else {
        state = new State(state.enemy_pieces, state.pieces, 1);
        state.turn -= 1; 
        cpu();
      }
      topMenu.style.pointerEvents = 'none';
      playFlag = true;
    }
  });

  // RESET button
  const reset = document.querySelector('.reset');
  reset.addEventListener('click', function () {
    finishDialog.style.display = 'none';
    clearPieces();
    state = new State();
    turnText.textContent = '1 turn';
    setPieces();
    topMenu.style.pointerEvents = 'auto';
    playFlag = false;
    playerFlag = false;
    selectedIndex = -1;
  });

  // Close button
  document.querySelector('.close-btn').addEventListener('click', function () {
    finishDialog.style.display = 'none';
  });
});

function onClick([x, y]) {
  if (playerFlag) {
    const clickedIndex = findPositionIndex(state.pieces, [x, y]);
    if (clickedIndex >= 0) {
      if (selectedIndex >= 0) {
        if (selectedIndex === clickedIndex) {
          toggleMoveMass();  // remove
          selectedIndex = -1;
        }
        else {
          toggleMoveMass();  // remove
          selectedIndex = clickedIndex;
          toggleMoveMass();  // add
        }
      }
      else {
        selectedIndex = clickedIndex;
        toggleMoveMass();  // add
      }
    }
    else if (includesAction(state.legalActions(), [selectedIndex, [x, y]])) {
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
    if (action[0] === selectedIndex) {
      hexagonElement(action[1]).classList.toggle('move-mass');
    }
  });
}

function movePiece([index, [x, y]]) {
  const piece = pieceElement(state.pieces[index]);
  pieceElement([x, y]).dataset.state = piece.dataset.state;
  piece.dataset.state = '';
  state = state.next([index, [x, y]]);
  turnText.textContent = `${state.turn + 1} turn`;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function cpu() {
  await sleep(CPU_DELAY_MS);
  const action = alphabetaAction(state, level);
  movePiece(action);
  (state.isLose()) ? fin() : playerFlag = true;
}

function fin() {
  finishDialog.style.display = 'block';
  winnerText.textContent = ((state.turn + 1) % 2 === sengo - 1) ? 'YOU WIN!' : 'CPU WIN';
}
