import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { Category2Button, CategoryBreadcrumb } from "./components/SearchForm.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const render = async () => {
  const $root = document.getElementById("root");

  if (window.location.pathname === "/") {
    $root.innerHTML = HomePage({ isLoading: true });
    const data = await getProducts();
    const categories = await getCategories();
    $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

    // 상품 카드 클릭 이벤트 핸들러 -> 상세 페이지로 이동
    document.addEventListener("click", (event) => {
      if (event.target.closest(".product-card")) {
        const productId = event.target.closest(".product-card").dataset.productId;
        history.pushState("", "", `/product/${productId}`);
        render();
      }
    });

    // breadcrumb 전체 버튼 클릭 시 필터 초기화
    document.addEventListener("click", async (event) => {
      if (event.target.closest("button[data-breadcrumb='reset']")) {
        const data = await getProducts();
        $root.innerHTML = HomePage({ ...data, categories, isLoading: false });
      }
    });

    // breadcrumb 카테고리 1 버튼 클릭 시 필터 적용
    document.addEventListener("click", async (event) => {
      if (event.target.closest("button[data-breadcrumb='category1']")) {
        const category1 = event.target.closest("button[data-breadcrumb='category1']").dataset.category1;
        const data = await getProducts({ category1 });
        $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

        // 카테고리 1 필터에 적용
        const categoryBreadcrumb = CategoryBreadcrumb(category1);
        // data-breadcrumb="reset" 옆에 categoryBreadcrumb를 추가
        const categoryBreadcrumbContainer = document.querySelector("button[data-breadcrumb='reset']");
        categoryBreadcrumbContainer.insertAdjacentHTML("afterend", categoryBreadcrumb);

        // 카테고리 2 목록 버튼 보여주기
        const category2Buttons = Object.keys(categories[category1])
          .map((category2) => Category2Button(category1, category2))
          .join("");
        const categoryFilterButtons = document.getElementById("category-filter-buttons");
        categoryFilterButtons.innerHTML = category2Buttons;
      }
    });

    // 카테고리 1 필터 버튼 클릭 이벤트 핸들러
    document.addEventListener("click", async (event) => {
      if (event.target.closest(".category1-filter-btn")) {
        const category1 = event.target.closest(".category1-filter-btn").dataset.category1;

        const data = await getProducts({ category1 });
        $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

        // 카테고리 1 필터에 적용
        const categoryBreadcrumb = CategoryBreadcrumb(category1);
        // data-breadcrumb="reset" 옆에 categoryBreadcrumb를 추가
        const categoryBreadcrumbContainer = document.querySelector("button[data-breadcrumb='reset']");
        categoryBreadcrumbContainer.insertAdjacentHTML("afterend", categoryBreadcrumb);

        // 카테고리 2 목록 버튼 보여주기
        const category2Buttons = Object.keys(categories[category1])
          .map((category2) => Category2Button(category1, category2))
          .join("");
        const categoryFilterButtons = document.getElementById("category-filter-buttons");
        categoryFilterButtons.innerHTML = category2Buttons;
      }
    });

    // 카테고리 2 버튼 클릭 이벤트 핸들러
    document.addEventListener("click", async (event) => {
      if (event.target.closest(".category2-filter-btn")) {
        const category1 = event.target.closest(".category2-filter-btn").dataset.category1;
        const category2 = event.target.closest(".category2-filter-btn").dataset.category2;

        const data = await getProducts({ category1, category2 });
        $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

        // 카테고리 2 필터에 적용
        const categoryBreadcrumb = CategoryBreadcrumb(category1, category2);
        const categoryBreadcrumbContainer = document.querySelector("button[data-breadcrumb='reset']");
        categoryBreadcrumbContainer.insertAdjacentHTML("afterend", categoryBreadcrumb);

        // 카테고리 2 목록 버튼 보여주기
        const category2Buttons = Object.keys(categories[category1])
          .map((item) => Category2Button(category1, item, category2 === item))
          .join("");
        const categoryFilterButtons = document.getElementById("category-filter-buttons");
        categoryFilterButtons.innerHTML = category2Buttons;
      }
    });
  } else {
    const productId = window.location.pathname.split("/").pop();
    $root.innerHTML = DetailPage({ isLoading: true });
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ ...data, isLoading: false });
  }
  window.addEventListener("popstate", render);
};

async function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
