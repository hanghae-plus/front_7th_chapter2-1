import { Filter } from "@/components/filter/index.js";
import { Layout } from "@/components/layout/index.js";
import { closeModal } from "@/components/modal/core.js";
import { ProductList } from "@/components/product-list/index.js";
import { actions, dispatch, store } from "@/store/store.js";
import { addToCart } from "../components/modal/core";
import { toast } from "../store/toast";

export function ProductListPage(router) {
  let unsubscribe = null;
  let observer = null;

  function create() {
    return html`${Layout()}`;
  }

  function render() {
    const container = document.querySelector("main"); // products-grid
    if (!container) {
      document.innerHTML = "";
      return;
    }

    // const success = document.createElement("div");
    // success.className = "toast fixed bottom-10 left-[50%] translate-x-[-50%] z-[100]";
    // success.innerHTML = Success();
    // document.querySelector("#root").appendChild(success);
    container.innerHTML = `${Filter()}${ProductList()}`;

    const sentinel = document.createElement("div");
    sentinel.id = "product-list-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.className = "h-1";
    container.appendChild(sentinel);
    setupInfiniteScroll(sentinel);
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

  function setupInfiniteScroll(sentinel) {
    if (!sentinel) return;

    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        const { pagination, isFetching } = store.state;
        if (isFetching) return;
        const currentPage = pagination?.page ?? 1;
        if (!(pagination?.hasNext ?? false)) return;

        dispatch.fetchProducts({ page: currentPage + 1 });
      },
      { root: null, rootMargin: "0px 0px 200px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
  }

  function handleClick(e) {
    const target = e.target;
    const { category1, category2, breadcrumb } = target.dataset;

    if (category1) {
      // actions.setFilters({ category1 });
      dispatch.fetchProducts({ category1, page: 1 });
    }

    if (category2) {
      // actions.setFilters({ category2 });
      dispatch.fetchProducts({ category2, page: 1 });
    }

    if (breadcrumb) {
      dispatch.fetchProducts({ category1: "", category2: "", page: 1 });
    }

    if (target.closest("#error-retry-btn")) {
      dispatch.fetchProducts();
      return;
    }

    if (target.closest(".product-card")) {
      const { productId } = target.closest(".product-card").dataset;
      if (target.nodeName === "BUTTON") {
        const target = store.state.products.find((product) => product.productId === productId);
        addToCart(target);
        toast.success("장바구니에 추가되었습니다", { id: "toast-success" });
        return;
      }

      router.push(`/product/${productId}`);
    }
  }

  const handleChange = (e) => {
    if (!["limit-select", "sort-select"].includes(e.target.id)) return;
    let filter = { page: 1 };
    switch (e.target.id) {
      case "limit-select":
        filter.limit = Number(e.target.value);
        break;
      case "sort-select":
        filter.sort = e.target.value;
        break;
    }

    actions.setFilters(filter);
    dispatch.fetchProducts(filter);
  };

  const handleKeydown = (e) => {
    if (!e.target.matches("#search-input")) return;
    if (e.key !== "Enter") return;
    // actions.setFilters({ search: e.target.value });
    dispatch.fetchProducts({ search: e.target.value, page: 1 });
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
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    const container = document.querySelector("main");
    container?.removeEventListener("click", handleClick);
    container?.removeEventListener("keydown", handleKeydown);
    container?.removeEventListener("change", handleChange);
    closeModal();
    unsubscribe = null;
  }

  return { create, mount, unmount };
}
