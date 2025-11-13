import { Footer } from "../components/Footer.js";
import { Header } from "../components/Header.js";
import Products from "../components/Products.js";
import ProductSearchFilter from "../components/ProductSearchFilter.js";

const ProductList = (targetNode) => {
  const didMount = () => {
    // const $headerNode = document.querySelector("[data-component='product-list-layout']");
    const $mainNode = document.querySelector("[data-component='product-list-main']");
    // const $footerNode = document.querySelector("[data-component='product-list-footer']");

    // Header($headerNode, { title: "쇼핑몰" });
    ProductSearchFilter($mainNode);
    Products($mainNode);
    // Footer($footerNode);
  };

  const render = () => {
    targetNode.innerHTML = /* HTML */ `
      <div class="bg-gray-50" data-component="product-list-layout">
        ${Header({ title: "쇼핑몰" })}
        <main class="max-w-md mx-auto px-4 py-4" data-component="product-list-main"></main>
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
