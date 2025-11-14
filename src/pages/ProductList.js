import { Footer } from "../components/Footer.js";
import { Header } from "../components/Header.js";
import Products from "../components/Products.js";
import ProductSearchFilter from "../components/ProductSearchFilter.js";

const ProductList = (targetNode) => {
  const didMount = () => {
    const $SearchFilterNode = document.querySelector("[data-component='search-filter']");
    const $ProductsNode = document.querySelector("[data-component='products']");

    ProductSearchFilter($SearchFilterNode);
    Products($ProductsNode);
  };

  const render = () => {
    targetNode.innerHTML = /* HTML */ `
      <div class="bg-gray-50" data-component="product-list-layout">
        ${Header({ title: "쇼핑몰" })}
        <main class="max-w-md mx-auto px-4 py-4">
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
            data-component="search-filter"
          ></div>
          <div class="mb-6" data-component="products"></div>
        </main>
        ${Footer()}
      </div>
    `;
  };

  const onMount = (targetNode) => {
    render(targetNode);
    didMount();
  };

  onMount(targetNode);
};

export default ProductList;
