import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { pathToRegex } from "./utils/route";
import { getCategories } from "./api/productApi";
import appStore from "./store/app-store";
import { getProducts } from "./api/productApi";
import { getProduct } from "./api/productApi";

/** @typedef {import('./types.js').HomePageProps} HomePageProps */
/** @typedef {import('./types.js').ProductDetailPageProps} ProductDetailPageProps */

const appState = appStore.getState();

export const ROUTES = Object.freeze({
  home: {
    name: "home",
    path: "/",
    pattern: pathToRegex("/"),
    render: HomePage,
    /**
     * @param {object} params
     * @returns {Promise<HomePageProps>}
     */
    loader: async (params = {}) => {
      console.log("home loader", params);
      if (appState.categories.length === 0) {
        const categoriesResponse = await getCategories();
        appStore.setCategories(categoriesResponse);
      }
      const listResponse = await getProducts({
        limit: appState.listResponse.pagination.limit,
        search: appState.listResponse.filters.search,
        category1: appState.listResponse.filters.category1,
        category2: appState.listResponse.filters.category2,
        sort: appState.listResponse.filters.sort,
      });

      appStore.setListResponse(listResponse);

      return {
        loading: false,
        categories: appState.categories,
        productListResponse: appState.listResponse,
        cart: appState.cart,
      };
    },
  },
  productDetail: {
    name: "productDetail",
    path: "/product/:id",
    pattern: pathToRegex("/product/:id"),
    render: ProductDetailPage,
    /**
     * @param {{ id: string }} params
     * @returns {Promise<ProductDetailPageProps>}
     */
    loader: async (params) => {
      const { id } = params;
      const response = await getProduct(id);
      appStore.setProductDetail(response);

      const listResponse = await getProducts({
        category1: appState.productDetail?.category1,
        category2: appState.productDetail?.category2,
      });
      appStore.setProductDetailListResponse(listResponse);
      appStore.setCartItemCount(1);

      return {
        loading: false,
        productDetailResponse: appState.productDetail,
        productDetailListResponse: appState.productDetailListResponse,
        cart: appState.cart,
      };
    },
  },
});
