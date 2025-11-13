import { Layout } from "@/components/layout/index.js";
import { DetailProduct } from "@/components/product/index.js";
import { dispatch, store } from "@/store/store.js";

// TODO: 여기 클릭이벤트 넣으면서 라우터 props 추가해야함
export function ProductDetailPage() {
  let unsubscribe = null;

  function create() {
    return html`${Layout()}`;
  }

  function render() {
    const container = document.querySelector("main");
    if (!container) {
      document.innerHTML = "";
      return;
    }

    // const { products, isFetching } = state;
    // container.innerHTML = `${isFetching ? ProductListSkeleton() : products.map((product) => `${ProductItem(product)}`).join("")} `;
    container.innerHTML = `${DetailProduct()}`;
  }

  // function handleClick(e) {
  //   const target = e.target;
  //   const { category1, category2, breadcrumb, productId } = target.dataset;

  //   if (category1) {
  //     actions.setFilters({ category1 });
  //   }
  // }

  function mount() {
    unsubscribe = store.subscribe((state) => {
      render(state);
    });

    const productId = location.pathname.split("/").pop();
    dispatch.fetchProduct(productId);

    if (!store.state.products.length) {
      dispatch.fetchProducts();
    }

    render(store.state);
    // const container = document.querySelector("main");
    // container?.addEventListener("click", handleClick);
  }

  function unmount() {
    if (unsubscribe) unsubscribe();
    // const container = document.querySelector("main");
    // container?.removeEventListener("click", handleClick);
    unsubscribe = null;
  }

  return { create, mount, unmount };
}
