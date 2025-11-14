import { Footer, Header } from "./components/index.js";
import { Error } from "./pages/error.js";
import { routes } from "./routes.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        // 여기
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 동적 라우팅 매칭 함수
function matchRoute(path) {
  // 1. 정확한 경로 매칭 먼저 시도 (예: "/" → Home)
  if (routes[path]) {
    return { page: routes[path], params: {} };
  }

  // 2. 동적 경로 매칭 (예: "/product/123" → "/product/:id")
  for (const [route, page] of Object.entries(routes)) {
    const routeParts = route.split("/");
    const pathParts = path.split("/");

    // 경로의 길이가 다르면 매칭 불가
    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let isMatch = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        // 동적 파라미터 (예: ":id")
        const paramName = routeParts[i].slice(1); // ":" 제거
        params[paramName] = pathParts[i]; // 실제 값 저장
      } else if (routeParts[i] !== pathParts[i]) {
        // 정적 부분이 일치하지 않으면 매칭 실패
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return { page, params };
    }
  }

  return null;
}

function renderPage(isLoading = false) {
  const $root = document.getElementById("root");
  const path = window.location.pathname;
  const basePath = import.meta.env.BASE_URL; // vite 제공
  const relativePath = path.replace(basePath, "/").replace(/\/$/, "") || "/";

  const match = matchRoute(relativePath);

  if (match) {
    const { page: Page, params } = match;
    // 상품 상세 페이지인지 확인
    const isDetailPage = relativePath.startsWith("/product/");

    $root.innerHTML = `
    <div class="${isLoading ? "min-h-screen bg-gray-50" : ""} bg-gray-50">
      ${Header(isDetailPage)}
        ${Page(params)}
        ${Footer()}
      </div>
    `;
  } else {
    $root.innerHTML = `
      ${Error()}
    `;
  }
}

// 어플리케이션 시작
function main() {
  renderPage();
  // fetchData().then(() => {
  //   renderPage(false); // 로딩 완료 후 다시 렌더
  // });

  // SPA처럼 동작하도록 링크 클릭 시 라우팅 처리
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && link.matches("[data-link]")) {
      e.preventDefault();
      history.pushState(null, "", link.href);
      renderPage();
    }
  });

  // 브라우저 뒤로가기/앞으로가기 대응
  window.addEventListener("popstate", renderPage);
}

// 어플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
