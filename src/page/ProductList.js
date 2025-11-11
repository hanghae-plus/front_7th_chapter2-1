import { ProductItem, ProductListSkeleton } from "@/components/product-list/index.js";
import { store } from "@/store/store.js";

export function ProductListPage(elementId) {
  let container = document.getElementById(elementId); // products-grid
  let unsubscribe = null;

  function create() {
    // TODO: 여기서 elementId설정해줬을 때 router에서 호출하고 dom찾는데 문제 없는 지 체크해야함
    // TODO: createProductListPage + 다른 컴포넌트도 조합되어야함 -> 어떻게할껀지 고민필요
    return html`<div class="grid grid-cols-2 gap-4 mb-6" id="${elementId}"></div>`;
  }

  function render(state) {
    if (!container) {
      return (document.innerHTML = "");
    }

    const { products, isLoading } = state;
    container.innerHTML = `${isLoading ? ProductListSkeleton() : products.map((product) => `${ProductItem(product)}`).join("")} `;
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
    if (!container) return;

    unsubscribe = store.subscribe((state) => {
      render(state);
    });

    render(store.state);
    // container.addEventListener("click", handleClick);
  }

  function unmount() {
    if (unsubscribe) unsubscribe();
    // container.removeEventListener("click", handleClick);
    container = null;
    unsubscribe = null;
  }

  return { create, mount, unmount };
}
