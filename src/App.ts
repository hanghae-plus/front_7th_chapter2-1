import { AppContents, ProductListPage } from "./pages";
import createRouter from "./router";
import { fetchProducts } from "./store/products-list/fetchProducts";
import { ProductState, productStore } from "./store/products-list/productStore";
import { setupFilterEventHandlers } from "./components/SearchForm/filterEventHandlers";

export default function App() {
  const $root = document.querySelector("#root");

  const renderHome = (state: ProductState) => {
    $root.innerHTML = AppContents({
      children: ProductListPage(state),
    });
    // DOM 렌더링 후 이벤트 리스너 등록
    setupFilterEventHandlers();
  };

  const pages = {
    home: () => {
      const currentState = productStore.getState();
      renderHome(currentState);
    },
    products: () => ($root.innerHTML = AppContents({ children: `products 입니다` })),
  };
  const router = createRouter();

  router.addRoute("#/", pages.home).addRoute("#/products", pages.products).start();

  productStore.subscribe((state) => {
    const hash = window.location.hash || "#/";

    if (hash === "#/" || hash === "" || hash === "#") {
      renderHome(state);
    }
  });

  fetchProducts(productStore.getState().params);
}
