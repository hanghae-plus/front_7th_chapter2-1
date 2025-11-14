import PageLayout from "../layouts/PageLayout";
import ProductDetail from "../components/ProductDetail";
import createComponent from "../core/component/create-component";
import { getProduct, getProducts } from "../api/productApi";

export const 상세페이지_로딩 = /* HTML */ `
  <main class="max-w-md mx-auto px-4 py-4">
    <div class="py-20 bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">상품 정보를 불러오는 중...</p>
      </div>
    </div>
  </main>
`;

// /**
//  * @typedef {import('../types.js').ProductDetailPageProps} ProductDetailPageProps
//  */

// /**
//  * @param {ProductDetailPageProps} props
//  */
// export default function ProductDetailPage({ loading, productDetailResponse, productDetailListResponse, cart = [] }) {
//   if (loading) {
//     return PageLayout.mount({ children: 상세페이지_로딩, isDetailPage: true, cart });
//   }
//   return PageLayout.mount({
//     // children: ProductDetail({ productDetailResponse, productDetailListResponse }),
//     children: ProductDetail.mount({ productDetailResponse, productDetailListResponse }).outerHTML,
//     isDetailPage: true,
//     cart,
//   });
// }

const ProductDetailPage = createComponent({
  id: "product-detail-page",
  props: {
    id: "",
  },
  initialState: (props) => {
    return {
      id: props.id,
      productDetailResponse: null,
      productDetailListResponse: null,
      isLoading: false,
    };
  },
  effects: {
    onMount: async ({ getState, setState }) => {
      const id = getState("id");
      setState("isLoading", true);
      try {
        const response = await getProduct(id);
        const listResponse = await getProducts({
          category1: response.category1,
          category2: response.category2,
        });
        setState("productDetailResponse", response);
        setState("productDetailListResponse", listResponse);
      } catch (error) {
        console.error("[ProductDetailPage] onMount error", error);
      } finally {
        setState("isLoading", false);
      }
    },
  },
  templateFn: (_, { productDetailResponse, productDetailListResponse, isLoading }) => {
    return PageLayout.mount({
      children: isLoading
        ? 상세페이지_로딩
        : ProductDetail.mount({ productDetailResponse, productDetailListResponse }).outerHTML,
      isDetailPage: true,
    }).outerHTML;
  },
});

export default ProductDetailPage;
