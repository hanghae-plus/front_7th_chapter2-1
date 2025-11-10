import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { updateCategoryUI } from "./utils/categoryUI.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const push = (path) => {
  history.pushState(null, null, path);
  render();
};

const render = async () => {
  const $root = document.querySelector("#root");

  if (location.pathname === "/") {
    $root.innerHTML = HomePage({ loading: true });

    const [categories, products] = await Promise.all([getCategories(), getProducts()]);

    $root.innerHTML = HomePage({
      categories,
      ...products,
      loading: false,
    });

    //     Promise.all([
    //   getCategories().then(categories =>{
    //     document.getElementById('category-container').innerHTML = Category({ categories });
    //   }),
    //   getProducts().then(products =>{
    //      $root.innerHTML = HomePage({ products, loading: false });
    //   }
    // ])

    // 카테고리 상태 관리
    let selectedCat1 = null;
    let selectedCat2 = null;
    // 통합 클릭 이벤트 핸들러
    document.body.addEventListener("click", (e) => {
      const target = e.target;
      const productCard = target.closest(".product-card");
      const resetBtn = target.closest('[data-breadcrumb="reset"]');
      const cat1Btn = target.closest(".category1-filter-btn, [data-breadcrumb='category1']");
      const cat2Btn = target.closest(".category2-filter-btn");

      // 상품 카드 클릭
      if (productCard) {
        push(`/products/${productCard.dataset.productId}`);
        return;
      }

      // 카테고리 필터 처리
      if (resetBtn) {
        selectedCat1 = null;
        selectedCat2 = null;
        updateCategoryUI(selectedCat1, selectedCat2);
      } else if (cat1Btn) {
        selectedCat1 = cat1Btn.dataset.category1;
        selectedCat2 = null;
        updateCategoryUI(selectedCat1, selectedCat2);
      } else if (cat2Btn) {
        selectedCat1 = cat2Btn.dataset.category1;
        selectedCat2 = cat2Btn.dataset.category2;
        updateCategoryUI(selectedCat1, selectedCat2);
      }
    });
  } else {
    $root.innerHTML = DetailPage({ loading: true });

    const productId = location.pathname.split("/products/").pop();
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ loading: false, product: data });
  }
};

window.addEventListener("popstate", render);

const main = async () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
