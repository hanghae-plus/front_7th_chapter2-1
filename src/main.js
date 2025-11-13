import { Layout } from "./components/common";
import { ItemDetailPage } from "./pages";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function main() {
  const root = document.getElementById("root");
  if (!root) throw new Error("`#root` 요소를 찾을 수 없습니다.");

  // 페이지 렌더링
  const page = ItemDetailPage();
  root.innerHTML = Layout(page.content, page.headerOptions);

  // 페이지 초기화 (카테고리 로딩 등)
  if (page.init) {
    page.init();
  }
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
