'use strict';

// import {State} from './catena.js';

// alphabeta法 + rootNodeでbestActionも返す
function alphabeta(state, depth, alpha, beta, bestAction) {
  if (state.isLose()) {
    return (state.isFirstPlayer()) ? -100 - depth : 100 + depth;
  }
  if (depth == 0) {
    const value = state.evaluationValue();
    return (state.isFirstPlayer()) ? -value : value;
  }
  const actions = state.legalActions(true);
  if (state.isFirstPlayer()) {
    for (let i = 0; i < actions.length; i++) {
      let value = alphabeta(state.next(actions[i]), depth-1, alpha, beta, false);
      if (value > alpha) {
        alpha = value;
        if (bestAction) {
          bestAction = actions[i];
        }
      }
      if (alpha >= beta) {
        break;
      }
    }
    return (bestAction) ? [alpha, bestAction] : alpha;
  }
  else {
    for (let i = 0; i < actions.length; i++) {
      let value = alphabeta(state.next(actions[i]), depth-1, alpha, beta, false);
      if (value < beta) {
        beta = value;
        if (bestAction) {
          bestAction = actions[i];
        }
      }
      if (alpha >= beta) {
        break;
      }
    }
    return (bestAction) ? [beta, bestAction] : beta;
  }
}

export function alphabetaAction(state, depth) {
  return alphabeta(state, depth, -Infinity, Infinity, true)[1];
}
