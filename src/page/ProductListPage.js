import { ProductList } from "@/components/product-list/index.js";
import { dispatch, store } from "@/store/store.js";
import { Filter } from "../components/filter/index.js";
import { Layout } from "../components/layout/index.js";

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
    container.innerHTML = `${Filter()}<div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">${ProductList()}</div> `;
  }

  // function handleClick(e) {
  //   const target = e.target;
  //   const productId = target.dataset.id;

  //   if (target.classList.contains("view-detail")) {
  //     // 🔑 스토어 액션을 통해 라우팅
  //     actions.goToProductDetail(productId);
  //   }

  //   if (target.classList.contains("add-to-cart")) {
  //     const product = store.state.products.find((p) => p.id === productId);
  //     actions.addToCart(product);

  //     // 선택적: 장바구니 페이지로 이동
  //     // actions.goToCart();
  //   }
  // }

  function mount() {
    unsubscribe = store.subscribe((state) => {
      render(state);
    });

    dispatch.fetchProducts();

    render(store.state);
    // container.addEventListener("click", handleClick);
  }

  function unmount() {
    if (unsubscribe) unsubscribe();
    // container.removeEventListener("click", handleClick);
    unsubscribe = null;
  }

  return { create, mount, unmount };
}
