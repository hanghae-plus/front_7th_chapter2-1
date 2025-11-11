const createRouter = () => {
  let routes = [];
  let notFoundComponent = () => "<h1>404 Not Found</h1>";
  let querySubscribers = new Set();
  let currentQueryParams = {};

  // URL에서 쿼리를 파싱하는 함수
  const parseQuery = () => {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  };

  // 쿼리 구독자에게 변경 사항을 알리는 함수
  const notifyQuerySubscribers = () => {
    querySubscribers.forEach((callback) => callback(currentQueryParams));
  };

  // 경로 변경을 처리하는 메인 함수
  const handlePathChange = () => {
    const path = window.location.pathname;
    const route = routes.find((r) => r.path.test(path));
    const $root = document.getElementById("root");

    currentQueryParams = parseQuery(); // 경로 변경 시에도 쿼리 파라미터 업데이트

    if (!$root) {
      console.error("Root element #root not found.");
      return;
    }

    if (route) {
      const pathParams = path.match(route.path)?.groups || {};
      $root.innerHTML = route.component({ ...pathParams, ...currentQueryParams });
    } else {
      $root.innerHTML = notFoundComponent();
    }
    // 페이지 전체가 다시 렌더링될 때도 쿼리 구독자에게 알림
    notifyQuerySubscribers();
  };

  // 외부에 공개될 라우터 객체
  const router = {
    addRoute(path, component) {
      routes.push({ path, component });
    },

    setNotFound(component) {
      notFoundComponent = component;
    },

    /**
     * URL의 쿼리 파라미터만 업데이트하고, 구독자에게 알립니다.
     * @param {object} newQuery - { key: value } 형태의 새로운 쿼리 객체
     */
    updateQuery(newQuery) {
      const params = new URLSearchParams(window.location.search);
      Object.entries(newQuery).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      // pushState는 popstate 이벤트를 발생시키지 않으므로, 수동으로 상태를 업데이트하고 알려야 합니다.
      window.history.pushState({}, "", newUrl);

      currentQueryParams = parseQuery();
      // 페이지 전체를 다시 그리지 않고, 쿼리 구독자에게만 알립니다.
      // notifyQuerySubscribers();
      // 페이지 전체를 다시 그리는 현재 구조에서는 handlePathChange를 호출합니다.
      handlePathChange();
    },

    /**
     * 쿼리 파라미터 변경을 구독합니다.
     * @param {function} callback - 쿼리 변경 시 호출될 콜백 함수
     * @returns {function} - 구독 취소 함수
     */
    subscribeToQuery(callback) {
      querySubscribers.add(callback);
      callback(currentQueryParams); // 구독 즉시 현재 상태로 한 번 호출
      return () => querySubscribers.delete(callback); // 구독 취소 함수 반환
    },

    getQueryParams() {
      return { ...currentQueryParams };
    },

    navigate(path) {
      window.history.pushState({}, "", path);
      handlePathChange();
    },

    start() {
      if (!document.getElementById("root")) {
        document.body.innerHTML = '<div id="root"></div>';
      }
      window.addEventListener("popstate", handlePathChange);
      document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-link]");
        if (target) {
          e.preventDefault();
          this.navigate(target.getAttribute("href"));
        }
      });
      handlePathChange();
    },
  };
  return router;
};

export const router = createRouter();
