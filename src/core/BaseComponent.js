export const createComponent = (setup) => {
  return ({ root, props = {} }) => {
    let state = {};
    let view = () => "";
    const mountCallbacks = [];
    const renderCallbacks = [];
    let mountCleanups = [];
    let renderCleanups = [];

    const getState = () => ({ ...state });
    const setState = (patch) => {
      state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
      render();
    };

    const template = (fn) => {
      view = fn;
    };

    // DOM 이벤트 헬퍼 (자동 cleanup)
    const on = (target, event, handler) => {
      target.addEventListener(event, handler);
      mountCleanups.push(() => target.removeEventListener(event, handler));
    };

    // 최초 1번만 실행 (이벤트 구독 등)
    const onMount = (fn) => {
      mountCallbacks.push(fn);
    };

    // 매 업데이트마다 실행 (DOM 이벤트 바인딩)
    const onUpdated = (fn) => {
      console.log("onUpdated");
      renderCallbacks.push(fn);
    };

    const render = () => {
      console.log("render");
      // 이전 render 바인딩 제거
      renderCleanups.forEach((fn) => fn && fn());
      renderCleanups = [];

      // 그리기
      root.innerHTML = view(state);

      // render 후 콜백 실행 (DOM 이벤트용)
      renderCallbacks.forEach((fn) => {
        const cleanup = fn();
        if (typeof cleanup === "function") renderCleanups.push(cleanup);
      });
    };

    // setup 함수 실행 (props 전달)
    setup({ root, props, getState, setState, template, onMount, onUpdated, on });
    render();

    // mount 콜백 실행 (최초 1번만)
    mountCallbacks.forEach((fn) => {
      const cleanup = fn();
      if (typeof cleanup === "function") mountCleanups.push(cleanup);
    });

    return {
      getState,
      setState,
      unmount() {
        console.log("unmount");
        mountCleanups.forEach((fn) => fn && fn());
        renderCleanups.forEach((fn) => fn && fn());
        mountCleanups = [];
        renderCleanups = [];
        root.replaceChildren();
      },
    };
  };
};
