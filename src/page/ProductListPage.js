import { Filter } from "@/components/filter/index.js";
import { Layout } from "@/components/layout/index.js";
import { ProductList } from "@/components/product-list/index.js";
import { actions, dispatch, store } from "@/store/store.js";

export function ProductListPage() {
  let unsubscribe = null;

  function create() {
    return html`${Layout()}`;
  }

  function render() {
    const container = document.querySelector("main"); // products-grid
    if (!container) {
      document.innerHTML = "";
      return;
    }

    // const { products, isFetching } = state;
    // container.innerHTML = `${isFetching ? ProductListSkeleton() : products.map((product) => `${ProductItem(product)}`).join("")} `;
    container.innerHTML = `${Filter()}${ProductList()}`;
  }

  function handleClick(e) {
    const target = e.target;
    const { category1, category2, breadcrumb } = target.dataset;

    if (category1) {
      actions.setFilters({ category1 });
    }

    if (category2) {
      actions.setFilters({ category2 });
    }

    if (breadcrumb) {
      actions.setFilters({ category1: "", category2: "" });
    }

    console.log(target.classList.contains("category1-filter-btn"), target.dataset);

    // if (target.classList.contains("view-detail")) {
    //   // 🔑 스토어 액션을 통해 라우팅
    //   actions.goToProductDetail(productId);
    // }

    // if (target.classList.contains("add-to-cart")) {
    //   const product = store.state.products.find((p) => p.id === productId);
    //   actions.addToCart(product);

    //   // 선택적: 장바구니 페이지로 이동
    //   // actions.goToCart();
    // }
  }

  function mount() {
    unsubscribe = store.subscribe((state) => {
      render(state);
    });

    dispatch.fetchProducts();

    render(store.state);
    const container = document.querySelector("main");
    container?.addEventListener("click", handleClick);
  }

  function unmount() {
    if (unsubscribe) unsubscribe();
    const container = document.querySelector("main");
    container?.removeEventListener("click", handleClick);
    unsubscribe = null;
  }

  return { create, mount, unmount };
}
