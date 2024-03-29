'use strict'

const MAX_TURN = 100  // 100ターンで引き分け
const OUTPUT_SIZE = 3*61 + 4*6  // 207

function myIncludes(arr, [index, [x, y]]) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][0] == index && arr[i][1][0] == x && arr[i][1][1] == y) {
      return true;
    }
  }
  return false;
}

export class State {

  constructor(pieces=null, enemy_pieces=null, turn=0) {
    this.pieces = (turn) ? pieces : [[5, 9], [7, 9], [9, 9], [5, 7], [9, 7], [1, 3], [5, 3]];
    this.enemy_pieces = (turn) ? enemy_pieces : [[1, 1], [3, 1], [5, 1], [3, 7], [7, 7], [3, 3], [7, 3]];
    this.turn = turn;
    this.win = [];
    this.lose = false;
    // 方向定数:順に左下、右下、右、右上、左上、左
    this.dxy = [[0, 1], [1, 1], [1, 0], [0, -1], [-1, -1], [-1, 0]];
  }

  makeBoard() {
    // 0白マス 1グレーマス 2壁 3自分の王様 4自分の石 5相手の王様 6相手の石
    const board = [
      [2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
      [1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2],
      [1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1],
      [2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1],
      [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2]
    ];
    for (let i = 0; i < 7; i++) {
      board[this.pieces[i][0]][this.pieces[i][1]] = (i < 3) ? 3 : 4;
      board[this.enemy_pieces[i][0]][this.enemy_pieces[i][1]] = (i < 3) ? 5 : 6;
    }
    return board;
  }

  legalActions(efficient=false) {
    let board = this.makeBoard();
    let stk = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let actions = [];
    let parent, current, next_x, next_y, next;
    for (let i = 0; i < 3; i++) {
      stk[0] = this.pieces[i];
      board[this.pieces[i][0]][this.pieces[i][1]] = i+10;
      let stk_num = 1
      // 深さ優先探索
      while (stk_num > 0) {
        stk_num -= 1;
        parent = stk[stk_num];
        this.dxy.forEach(dxy => {
          current = parent;
          while (true) {
            next_x = current[0] + dxy[0];
            next_y = current[1] + dxy[1];
            next = board[next_x][next_y];
            // タッチできる場合 おかしいかも※※※
            if (next == 5) {
              if (efficient) {
                actions = [[i, current]];
                this.win = [[i, current]];
                return actions;
              }
              else {
                if (board[current[0]][current[1]] != i+20) {
                  actions.push([i, current]);
                  this.win.push([i, current]);
                  board[current[0]][current[1]] = i + 20;
                }
                break;
              }
            }
            else if (next == i+10) {  // ノードの重複を避ける
              break;
            }
            else if (next == 1 || next == 2 || next == 6) {
              if (current != parent) {
                if (board[current[0]][current[1]] != i+20) {
                  actions.push([i, current]);
                  board[current[0]][current[1]] = i + 20;
                }
              }
              break;
            }
            else if (next == 3 || next == 4) {
              if (current != parent) {
                if (board[current[0][current[1]]] != i+20) {
                  actions.push([i, current]);
                }
                board[current[0]][current[1]] = i+10;
                stk[stk_num] = current;
                stk_num += 1;
              }
              break;
            }
            else {
              current = [next_x, next_y];
            }
          }
        })
      }
      board[this.pieces[i][0]][this.pieces[i][1]] = 3;
    }
    for (let i = 3; i < 7; i++) {
      this.dxy.forEach(dxy => {
        next_x = this.pieces[i][0] + dxy[0];
        next_y = this.pieces[i][1] + dxy[1];
        if (0 <= next_x && next_x <= 10 && 0 <= next_y && next_y <= 10) {
          next = board[next_x][next_y];
          if (next <= 1 || 10 <= next) {
            actions.push([i, [next_x, next_y]]);
          }
        }
      })
    }
    return actions;
  }

  next(action) {
    let pieces = this.pieces.concat();
    let enemy_pieces = this.enemy_pieces.concat();
    pieces[action[0]] = action[1];
    let next_state = new State (enemy_pieces, pieces, this.turn+1);
    if (myIncludes(this.win, action)) {
      next_state.lose = true;
    }
    return next_state;
  }

  isFirstPlayer() {
    return this.turn % 2 == 0;
  }

  isLose() {
    return this.lose;
  }

  randomAction() {
    const actions = this.legalActions();
    const rand = Math.floor(Math.random()*actions.length);
    return actions[rand];
  }

  evaluationValue() {
    // 相手目線で計算
    let board = this.makeBoard();
    let stk = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let areaNum = 0, checkNum = 0;
    let parent, current, next_x, next_y, next;
    for (let i = 0; i < 3; i++) {
      stk[0] = this.enemy_pieces[i];
      board[this.enemy_pieces[i][0]][this.enemy_pieces[i][1]] = i+10;
      let stk_num = 1
      // 深さ優先探索
      while (stk_num > 0) {
        stk_num -= 1;
        parent = stk[stk_num];
        this.dxy.forEach(dxy => {
          current = parent;
          while (true) {
            next_x = current[0] + dxy[0];
            next_y = current[1] + dxy[1];
            next = board[next_x][next_y];
            if (next == 3) {  // タッチできる場合
              checkNum += 1;
            }
            if (next == i+10) {  // ノードの重複を避ける
              break;
            }
            else if (next == 1 || next == 2 || next == 4) {
              break;
            }
            else if (next == 5 || next == 6) {
              if (current != parent) {
                board[current[0]][current[1]] = i+10;
                stk[stk_num] = current;
                stk_num += 1;
              }
              break;
            }
            else {
              board[next_x][next_y] = 9;
              current = [next_x, next_y];
            }
          }
        })
      }
      board[this.enemy_pieces[i][0]][this.enemy_pieces[i][1]] = 5;
    }

    for (let i = 1; i < 10; i++) {
      for (let j = 1; j < 10; j++) {
        if (board[i][j] > 8) {
          areaNum += 1;
        }
      }
    }
    return areaNum + 4*checkNum + Math.floor(Math.random()*5);
  }

}
