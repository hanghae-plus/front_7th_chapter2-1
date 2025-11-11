// render 함수
// 라이프 사이클 포함
import { store } from "./store.js";
import { router } from "./router.js";

const $root = document.querySelector("#root");

let beforeRenderHooks = [];
let afterRenderHooks = [];

export const onBeforeRender = (fn) => {
  beforeRenderHooks.push(fn);
};

export const onAfterRender = (fn) => {
  afterRenderHooks.push(fn);
};

// 렌더 함수들
export const render = () => {
  // beforeRender 훅 실행
  beforeRenderHooks.forEach((fn) => fn());
  // 현재 라우터 컴포넌트 가져와야됨
  const { component, props } = router.getComponent();
  console.log("어케꺼내니", component, props);
  // 컴포넌트 렌더링
  $root.innerHTML = component({ ...props, ...store.state });
  // afterRender 훅 실행
  afterRenderHooks.forEach((fn) => fn());
};
