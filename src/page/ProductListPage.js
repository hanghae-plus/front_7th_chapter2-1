import { Filter } from "@/components/filter/index.js";
import { Layout } from "@/components/layout/index.js";
import { ProductList } from "@/components/product-list/index.js";
import { actions, dispatch, store } from "@/store/store.js";

export function ProductListPage(router) {
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

  function update(state) {
    const container = document.querySelector("main");
    if (!container) {
      return;
    }

    const selects = container.querySelectorAll("select");
    selects.forEach((select) => {
      const key = select.id.split("-")[0];
      const value = state.filters[key];
      if (value) {
        Array.from(select.options).find((option) => option.value === String(value)).selected = true;
      }
    });
  }

  function handleClick(e) {
    const target = e.target;
    const { category1, category2, breadcrumb } = target.dataset;

    if (category1) {
      // actions.setFilters({ category1 });
      dispatch.fetchProducts({ category1 });
    }

    if (category2) {
      // actions.setFilters({ category2 });
      dispatch.fetchProducts({ category2 });
    }

    if (breadcrumb) {
      // actions.setFilters({ category1: "", category2: "" });
      dispatch.fetchProducts({ category1: "", category2: "" });
    }

    console.log("breadcrumb-->", target.dataset);

    if (target.closest(".product-card")) {
      const { productId } = target.closest(".product-card").dataset;
      console.log("productId-->", target.closest(".product-card").dataset);
      // actions.setFilters({ category1: "", category2: "" });
      router.push(`/product/${productId}`);
    }

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

  const handleChange = (e) => {
    if (!e.target.matches("#limit-select")) return;
    actions.setFilters({ limit: Number(e.target.value) });
    dispatch.fetchProducts({ limit: Number(e.target.value) });
  };

  const handleKeydown = (e) => {
    console.log(e.target.value);
    if (!e.target.matches("#search-input")) return;
    if (e.key !== "Enter") return;
    // actions.setFilters({ search: e.target.value });
    dispatch.fetchProducts({ search: e.target.value });
  };

  function mount() {
    unsubscribe = store.subscribe((state) => {
      render(state);
      update(state);
    });

    render(store.state);
    dispatch.fetchProducts();
    const container = document.querySelector("main");
    container?.addEventListener("click", handleClick);
    container?.addEventListener("keydown", handleKeydown);
    container?.addEventListener("change", handleChange);
  }

  function unmount() {
    if (unsubscribe) unsubscribe();
    const container = document.querySelector("main");
    container?.removeEventListener("click", handleClick);
    container?.removeEventListener("keydown", handleKeydown);
    container?.addEventListener("change", handleChange);
    unsubscribe = null;
  }

  return { create, mount, unmount };
}
