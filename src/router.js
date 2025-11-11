/**
 * 옵저버 패턴 상세 내용
 *
 * 관찰 대상 (Subject): 브라우저의 window 객체 (history와 location)
 * 상태 (State): 현재 URL (window.location.pathname)
 * 구독자 목록 (Observers): App.js (유일한 구독자)
 * 구독 (Subscribe): window.addEventListener("popstate", router).
 *      --> router 함수를 popstate 이벤트의 '관찰자(Observer)'로 등록
 * 알림 (Notify): 브라우저가 '뒤로 가기' 등으로 URL이 변경되었을 때 popstate 이벤트를 발생시켜 우리에게 알려줍니다.
 *      --> 우리가 navigate 함수를 호출하는 것도 상태를 바꾸고 직접 알림을 주는 행위
 * */

let routes = [];
let notFoundComponent = () => "<h1>404 Not Found</h1>";

const router = () => {
  const path = window.location.pathname;
  const route = routes.find((route) => route.path.test(path));

  const $root = document.getElementById("root");
  if (!$root) {
    console.error("Root element #root not found.");
    return;
  }

  if (route) {
    const pathParams = path.match(route.path)?.groups || {};
    const queryParams = Object.fromEntries(new URLSearchParams(window.location.search));
    $root.innerHTML = route.component({ ...pathParams, ...queryParams });
  } else {
    $root.innerHTML = notFoundComponent();
  }
};

/**
 * 라우터 경로 등록
 * @param {(string | RegExp)} path 등록시킬 url 혹은 url 정규식
 * @param {function} component 컴포넌트 렌더링 함수
 * */
export const addRoute = (path, component) => {
  routes.push({ path, component });
};

/**
 * 404 페이지 등록 (등록된 경로 외의 url 접근 시 노출용)
 * @param {function} component 컴포넌트 렌더링 함수
 * */
export const setNotFound = (component) => {
  notFoundComponent = component;
};

export const navigate = (path) => {
  window.history.pushState({}, "", path);
  router();
};

export const startRouter = () => {
  if (!document.getElementById("root")) {
    document.body.innerHTML = '<div id="root"></div>';
  }

  window.addEventListener("popstate", router);

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-link]");
    if (target) {
      e.preventDefault();
      navigate(target.getAttribute("href"));
    }
  });

  router();
};
