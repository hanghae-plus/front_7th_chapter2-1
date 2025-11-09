import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import Products from "../components/Products";
import ProductSearchFilter from "../components/ProductSearchFilter";

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
