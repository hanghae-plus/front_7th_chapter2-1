import { Footer } from "../components/Footer.js";
import { Header } from "../components/Header.js";
import Products from "../components/Products.js";
import ProductSearchFilter from "../components/ProductSearchFilter.js";

const ProductList = () => {
  const render = (parentNode) => {
    console.log(parentNode);

    parentNode.innerHTML =
      /* HTML */
      `
        <div class="bg-gray-50">
          ${Header({ title: "쇼핑몰" })}
          <main class="max-w-md mx-auto px-4 py-4">${ProductSearchFilter().onMount()} ${Products().onMount()}</main>
          ${Footer()}
        </div>
      `;

    // return (
    //   /* HTML */
    //   `
    //     <div class="bg-gray-50">
    //       ${Header({ title: "쇼핑몰" })}
    //       <main class="max-w-md mx-auto px-4 py-4">${ProductSearchFilter().onMount()} ${Products().onMount()}</main>
    //       ${Footer()}
    //     </div>
    //   `
    // );
  };

  const onMount = (parentNode) => {
    render(parentNode);
  };

  const onUpdate = () => {};

  const onUnMount = () => {};

  return {
    onMount,
    onUpdate,
    onUnMount,
  };
};

export default ProductList;
