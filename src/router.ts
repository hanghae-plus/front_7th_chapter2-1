/**
 * 해시 기반 라우터를 생성하는 함수
 *
 * @returns {object} router - 라우터 객체로, `addRoute()`와 `start()` 메서드를 제공한다.
 *
 * @see {@link https://tech.kakaoent.com/front-end/2022/221124-router-without-library/ 라이브러리 없이 라우터(Router) 만들기 }
 *
 */
export default function createRouter() {
  const routes = []; // 라우트 목록을 담을 배열

  const router = {
    /**
     * 라우터 배열에 URL과 컴포넌트를 매핑하여 저장한다.
     *
     * @method addRoute
     * @param {string} fragment URL 해시 (예: "/#/home")
     * @param {Function} component 해당 경로에서 실행할 함수
     */
    addRoute(fragment, component) {
      routes.push({ fragment, component });
      return this;
    },
    /**
     * URL 해시 변경을 감지하여 해당 경로의 컴포넌트를 실행한다.
     *
     * @method start
     * @fires window#hashchange
     * @description
     * 1. `checkRoutes` 함수에서 현재 URL 해시(`window.location.hash`)를 읽고, `routes` 배열에서 일치하는 항목을 찾는다.
     * 2. 해당 라우트의 `component` 함수를 실행하여 화면을 렌더링한다.
     * 3. `window` 객체에 `hashchange` 이벤트 리스너를 등록하여 사용자가 해시를 변경할 때마다 자동으로 `checkRoutes()`가 호출된다.
     * 4. 초기 로드 시에도 한 번 실행하여 첫 화면을 표시한다.
     */
    start() {
      const checkRoutes = () => {
        const currentRoute = routes.find((route) => route.fragment === window.location.hash) ?? routes[0];

        if (!currentRoute) return;
        currentRoute.component();
      };

      window.addEventListener("hashchange", checkRoutes);
      checkRoutes();
    },
  };

  return router;
}
