import ProductDetail from "./pages/ProductDetail.js";
import ProductList from "./pages/ProductList.js";
import NotFound from "./pages/NotFound.js";
import router from "./Router.js";

const App = () => {
  router.init([
    { path: "/", component: ProductList },
    { path: "/product/:id", component: ProductDetail },
    { path: "*", component: NotFound },
  ]);
};

export default App;
