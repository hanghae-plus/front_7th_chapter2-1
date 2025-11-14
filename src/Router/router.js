const createRouter = () => {
  let routes = [];
  let notFoundComponent = () => "<h1>404 Not Found</h1>";
  let querySubscribers = new Set();
  let currentQueryParams = {};
  let currentOnUnmount = null; // 현재 페이지의 unmount 함수를 저장

  // URL에서 쿼리를 파싱하는 함수
  const parseQuery = () => {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  };

  // 쿼리 구독자에게 변경 사항을 알리는 함수
  const notifyQuerySubscribers = () => {
    console.log("router - notify!", querySubscribers);
    querySubscribers.forEach((callback) => callback(currentQueryParams));
  };

  /**
   * 경로 변경 처리용 메인 함수
   * */
  const handlePathChange = () => {
    // 이전 페이지의 정리(unmount) 함수가 있으면 실행
    if (currentOnUnmount) {
      console.log("handlePathChange - currentOnUnmount", currentOnUnmount);
      currentOnUnmount();
      currentOnUnmount = null;
    }

    const path = window.location.pathname;
    const route = routes.find((r) => r.path.test(path));
    const $mainContentContainer = document.getElementById("main-content-container"); // 변경된 선택자

    currentQueryParams = parseQuery(); // 경로 변경 시에도 쿼리 파라미터 업데이트

    // #main-content-container는 App.js에서 초기 렌더링 시 생성되므로 존재함
    if (!$mainContentContainer) {
      console.error("Main content container #main-content-container not found.");
      return;
    }

    let pageComponent;
    if (route) {
      const pathParams = path.match(route.path)?.groups || {};
      pageComponent = route.component({ params: { ...pathParams, ...currentQueryParams } });
    } else {
      pageComponent = notFoundComponent();
    }

    // 새 페이지 렌더링 및 초기화(mount)
    // 이제 메인 콘텐츠 컨테이너만 업데이트 로직 실행
    $mainContentContainer.innerHTML = pageComponent.html;
    if (pageComponent.onMount) {
      console.log("handlePathChange - pageComponent", pageComponent);
      currentOnUnmount = pageComponent.onMount(); // onMount는 onUnmount 함수를 반환
    }

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
     * URL의 쿼리 파라미터 업데이트 + 구독자에게 데이터 변화 감지
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
      handlePathChange();
    },

    /**
     * 쿼리 파라미터 변경 감지
     * @param {function} callback - 쿼리 변경 시 호출될 콜백 함수
     * @returns {function} - 구독 취소 함수
     */
    // subscribeToQuery(callback) {
    //   querySubscribers.add(callback);
    //   callback(currentQueryParams); // 구독 즉시 현재 상태로 한 번 호출
    //   return () => querySubscribers.delete(callback); // 구독 취소 함수 반환
    // },

    // getQueryParams() {
    //   return { ...currentQueryParams };
    // },

    navigate(path) {
      window.history.pushState({}, "", path);
      handlePathChange();
    },

    /**
     * 현재 페이지를 다시 렌더링
     * URL 변경 없이, 현재 라우트의 컴포넌트를 다시 마운트
     * (handlePathChange가 캡슐화 돼있어, 대신 호출될 외부 함수 생서함)
     */
    renderCurrentPage() {
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
