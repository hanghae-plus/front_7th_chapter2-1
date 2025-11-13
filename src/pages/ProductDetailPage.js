import PageLayout from "../layouts/PageLayout";
import ProductDetail from "../components/ProductDetail";

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

/**
 * @typedef {import('../types.js').ProductDetailPageProps} ProductDetailPageProps
 */

/**
 * @param {ProductDetailPageProps} props
 */
export default function ProductDetailPage({ loading, productDetailResponse, productDetailListResponse, cart = [] }) {
  if (loading) {
    return PageLayout.mount({ children: 상세페이지_로딩, isDetailPage: true, cart });
  }
  return PageLayout.mount({
    // children: ProductDetail({ productDetailResponse, productDetailListResponse }),
    children: ProductDetail.mount({ productDetailResponse, productDetailListResponse }).outerHTML,
    isDetailPage: true,
    cart,
  });
}
