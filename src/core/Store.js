// Vuex 스타일의 Store
import { observable } from "./observer.js";

export class Store {
  #state;
  #mutations;
  #actions;
  state = {};

  constructor({ state, mutations, actions }) {
    this.#state = observable(state);
    this.#mutations = mutations;
    this.#actions = actions;

    Object.keys(state).forEach((key) => {
      Object.defineProperty(this.state, key, {
        get: () => this.#state[key],
      });
    });
  }

  // state 변경은 오직 commit을 통해서만 가능
  commit(action, payload) {
    this.#mutations[action](this.#state, payload);
  }

  // 비동기 작업은 dispatch를 통해 처리
  dispatch(action, payload) {
    return this.#actions[action](
      {
        state: this.#state,
        commit: this.commit.bind(this),
        dispatch: this.dispatch.bind(this),
      },
      payload,
    );
  }
}
