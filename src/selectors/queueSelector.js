import { flatten } from 'lodash';

export function selectQueue (currency) {
  return function (state) {
    return state.queue[currency];
  }
}

export function selectQueues (state) {
  return state.queue;
}

export function selectAllQueues (state) {
  const queues = Object.values(state.queue);
  return flatten(queues);
}

export function selectQueuedTokens (state) {
  return Object.keys(state.queue);
}
