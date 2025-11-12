import ProductDetail from "./pages/ProductDetail.js";
import ProductList from "./pages/ProductList.js";
import NotFound from "./pages/NotFound.js";
import Router from "./Router.js";

const App = () => {
  const router = new Router([
    { path: "/", component: ProductList },
    { path: "/product/:id", component: ProductDetail },
    { path: "*", component: NotFound },
  ]);
  router.init();

  addProductCardClickEventListener(router);
};

export default App;

const addProductCardClickEventListener = (router) => {
  document.body.addEventListener("click", (ev) => {
    const productImage = document.querySelector(".product-image");
    const productInfo = document.querySelector(".product-info");

    const eventTriggered = productImage?.contains(ev.target) || productInfo?.contains(ev.target);

    if (eventTriggered) {
      const productCard = ev.target.closest(".product-card");

      if (productCard) {
        const productId = productCard.dataset.productId;
        router.push(`/product/${productId}`);
      } else {
        console.error("Product card not found.");
      }
    }
  });
};
