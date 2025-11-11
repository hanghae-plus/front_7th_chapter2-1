import { Homepage } from "./pages/Homepage";
import { getProducts, getProduct } from "./api/productApi";
import { DetailPage } from "./pages/Detailpage";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) => {
    return worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    });
  });

const push = (path) => {
  history.pushState(null, null, path);
  render();
};

const render = async () => {
  const $root = document.querySelector("#root");
  const basePath = import.meta.env.BASE_URL;
  const pathName = window.location.pathname;
  // base path를 제거한 상대 경로 계산
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  if (relativePath === "/") {
    $root.innerHTML = Homepage({ loading: true });
    const data = await getProducts();
    console.log(data);
    $root.innerHTML = Homepage({ loading: false, ...data });

    document.body.addEventListener("click", (e) => {
      if (e.target.closest(".product-card")) {
        const productId = e.target.closest(".product-card").dataset.productId;
        push(`${import.meta.env.BASE_URL}product/${productId}`);
        render();
      }
    });
  } else {
    const productId = location.pathname.split("/").pop();
    $root.innerHTML = DetailPage({ loading: true });
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ loading: false, product: data });
  }
};

//뒤로가기 이벤트 핸들러
window.addEventListener("popstate", render);

const main = () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
