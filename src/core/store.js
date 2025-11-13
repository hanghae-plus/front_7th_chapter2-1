import { observable } from '@/core/observer';

/**
 * @function createStore
 * @description
 * Redux 스타일의 Store를 생성합니다.
 * - reducer를 통해 초기 상태를 생성하고 observable로 만듭니다.
 * - getState()는 읽기 전용 frozenState를 반환하지만, observable이므로 구독이 가능합니다.
 * - dispatch()를 통해서만 상태를 변경할 수 있습니다.
 * @param {Reducer} reducer (state, action) => newState 형태의 reducer 함수
 * @returns {Store} { getState, dispatch } 객체
 */
export const createStore = (reducer) => {
  /** @type {Record<string, any>} observable로 감싼 상태 */
  const state = observable(reducer());

  /** @type {Record<string, any>} 읽기 전용 상태 객체 (frozenState) */
  const frozenState = {};

  // frozenState의 각 속성을 getter만 가지도록 정의하여 읽기 전용으로 만듦
  // 하지만 getter가 state에 접근하므로 observable을 통해 구독이 가능함
  Object.keys(state).forEach((key) => {
    Object.defineProperty(frozenState, key, {
      get: () => state[key],
      configurable: true,
    });
  });

  /**
   * @function dispatch
   * @description
   * 액션을 디스패치하여 상태를 변경합니다.
   * reducer를 실행하여 새로운 상태를 얻고, state의 각 속성을 업데이트합니다.
   * @param {Action} action 디스패치할 액션
   */
  const dispatch = (action) => {
    const newState = reducer(state, action);

    for (const [key, value] of Object.entries(newState)) {
      // state에 존재하지 않는 key는 무시 (reducer가 반환한 추가 속성 제거)
      if (!(key in state)) continue;
      state[key] = value;
    }
  };

  /**
   * @function getState
   * @description
   * 현재 상태를 반환합니다. 반환된 객체는 읽기 전용이지만,
   * observable을 통해 구독이 가능합니다.
   * @returns {Record<string, any>} 읽기 전용 상태 객체
   */
  const getState = () => frozenState;

  return { getState, dispatch };
};
