import { Layout } from "@/components/layout/index.js";
import { DetailProduct } from "@/components/product/index.js";
import { actions, dispatch, store } from "@/store/store.js";
import { addToCart, openModal } from "../components/modal/core";
import { toast } from "../store/toast";

// TODO: 여기 클릭이벤트 넣으면서 라우터 props 추가해야함
export function ProductDetailPage(router) {
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

  function handleClick(e) {
    const target = e.target;
    console.log(target, target.dataset);
    const { category1, category2 } = target.dataset;

    if (target.closest("a")) {
      actions.setFilters({ category1: "", category2: "", page: 1 });
    }

    const input = document.querySelector("#quantity-input");
    if (target.closest("#add-to-cart-btn")) {
      addToCart(target);
      toast.success("장바구니에 추가되었습니다", { id: "toast-success" });
      return;
    }

    if (target.closest(".go-to-product-list")) {
      const { category1, category2 } = store.state.product;
      actions.setFilters({ category1, category2, page: 1 });
      router.push(`/`);
      return;
    }

    if (target.closest(".related-product-card")) {
      const id = target.closest(".related-product-card").dataset.productId;
      router.push(`/product/${id}`);
      return;
    }

    if (category1) {
      actions.setFilters({ category1, category2: "", page: 1 });
      router.push(`/`);
      return;
    }

    if (category2) {
      actions.setFilters({ category2, page: 1 });
      router.push(`/`);
      return;
    }

    if (target.closest("#quantity-decrease")) {
      const target = store.state.product;
      if (target.quantity > 1) {
        target.quantity--;
      } else {
        target.quantity = 1;
      }
      input.value = target.quantity;
      actions.setProduct(target);
    }

    console.log(input.value, input);
    if (target.closest("#quantity-increase")) {
      const target = store.state.product;
      if (target.quantity >= store.state.product.stock) {
        target.quantity = store.state.product.stock;
      } else {
        target.quantity++;
      }
      input.value = target.quantity;
      actions.setProduct(target);
    }
  }

  function openModalOnCartIconClick() {
    openModal();
  }

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
    const container = document.querySelector("main");
    container?.addEventListener("click", handleClick);
    document.querySelector("#cart-icon-btn").addEventListener("click", openModalOnCartIconClick);
  }

  function unmount() {
    if (unsubscribe) unsubscribe();
    const container = document.querySelector("main");
    container?.removeEventListener("click", handleClick);
    document.querySelector("#cart-icon-btn").removeEventListener("click", openModalOnCartIconClick);
    unsubscribe = null;
  }

  return { create, mount, unmount };
}
