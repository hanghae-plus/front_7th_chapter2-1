import { Footer } from "../components/Footer.js";
import { Header } from "../components/Header.js";
import Products from "../components/Products.js";
import ProductSearchFilter from "../components/ProductSearchFilter.js";

const ProductList = () => {
  return (
    /* HTML */
    `
      <div class="bg-gray-50">
        ${Header({ title: "쇼핑몰" })}
        <main class="max-w-md mx-auto px-4 py-4">${ProductSearchFilter()} ${Products()}</main>
        ${Footer()}
      </div>
    `
  );
};

export default ProductList;
