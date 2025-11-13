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
      console.log(target.nodeName);
      if (target.nodeName === "BUTTON") {
        console.log("setIsOpen");
        actions.setIsOpen(true);
        return;
      }

      router.push(`/product/${productId}`);
    }
  }

  const handleChange = (e) => {
    if (!["limit-select", "sort-select"].includes(e.target.id)) return;
    let filter = {};
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
