import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

const push = (path) => {
  history.pushState(null, null, path);
  render();
};

const render = async () => {
  const basePath = import.meta.env.BASE_URL;
  const pathName = location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  const $root = document.querySelector("#root");
  const searchParams = new URLSearchParams(location.search);
  const category1 = searchParams.get("category1");
  const category2 = searchParams.get("category2");
  const search = searchParams.get("search");
  const limit = +searchParams.get("limit");

  if (relativePath === "/") {
    $root.innerHTML = HomePage({ loading: true });
    const data = await getProducts({
      category1,
      category2,
      search,
      limit,
    });
    const categories = await getCategories();
    $root.innerHTML = HomePage({ ...data, loading: false, categories });

    document.addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        const productId = e.target.closest(".product-card").dataset.productId;
        push(`/products/${productId}`);
        return;
      }

      const category1Button = e.target.closest(".category1-filter-btn");
      if (category1Button) {
        searchParams.set("category1", e.target.dataset.category1);
        push(`/?${searchParams}`);
        return;
      }

      const category2Button = e.target.closest(".category2-filter-btn");
      if (category2Button) {
        searchParams.set("category2", e.target.dataset.category2);
        push(`/?${searchParams}`);
        return;
      }
    });

    const searchBar = document.querySelector("#search-input");
    searchBar.addEventListener("change", (e) => {
      searchBar.value = e.target.value;
    });

    const searchForm = document.querySelector("#search-form");
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      searchParams.set("search", searchBar.value);
      push(`/?${searchParams}`);
    });

    const limitSelect = document.querySelector("#limit-select");
    if (searchParams.get("limit")) limitSelect.value = searchParams.get("limit");
    limitSelect.addEventListener("change", (e) => {
      searchParams.set("limit", String(e.target.value));
      push(`/?${searchParams}`);
    });
  } else {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ loading: false, product: data });
  }

  window.addEventListener("popstate", () => render());
};

function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
