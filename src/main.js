import { Footer, Header } from "./components/index.js";
import { Error } from "./pages/error.js";
import { routes } from "./routes.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function renderPage(isLoading = false) {
  const $root = document.getElementById("root");
  const path = window.location.pathname;
  const Page = routes[path];

  if (Page) {
    $root.innerHTML = `
    <div class="${isLoading ? "min-h-screen bg-gray-50" : ""} bg-gray-50">
      ${Header()}
        ${Page()}
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
