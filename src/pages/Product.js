import { getProduct } from "@/api/productApi";
import Footer from "@/components/common/Footer";
import ProductDetail from "@/components/product/ProductDetail";
import ProductPageHeader from "@/components/product/ProductPageHeader";
import Breadcrumb from "@/components/product/Breadcrumb";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Component } from "@/core/Component";
import { Router } from "@/core/Router";

const Product = Component({
  template: ({ state }) => {
    const { loading, error } = state;

    return /* HTML */ `
      <div class="min-h-screen bg-gray-50">
        <div id="product-header"></div>
        <main class="max-w-md mx-auto px-4 py-4">
          ${loading
            ? /* HTML */ `<div class="py-20 bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p class="text-gray-600">상품 정보를 불러오는 중...</p>
                </div>
              </div>`
            : error
              ? /* HTML */ `<div class="py-20 bg-gray-50 flex items-center justify-center">
                  <div class="text-center">
                    <p class="text-red-600 mb-4">${error}</p>
                    <button id="go-home-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      홈으로 돌아가기
                    </button>
                  </div>
                </div>`
              : /* HTML */ `
                  <!-- 브레드크럼 -->
                  <div id="breadcrumb"></div>
                  <!-- 상품 상세 정보 -->
                  <div id="product-detail" class="mb-6"></div>
                  <!-- 상품 목록으로 이동 -->
                  <div class="mb-6">
                    <button
                      id="go-to-product-list"
                      class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
                      hover:bg-gray-200 transition-colors"
                    >
                      상품 목록으로 돌아가기
                    </button>
                  </div>
                  <!-- 관련 상품 -->
                  <div id="related-products"></div>
                `}
        </main>
        <footer id="footer" class="bg-white shadow-sm sticky top-0 z-40"></footer>
      </div>
    `;
  },

  initialState: () => ({
    product: null,
    productId: null,
    loading: true,
    error: null,
  }),

  setup: async (context) => {
    const { setState } = context;
    const router = Router();

    try {
      // URL에서 productId 추출
      const params = router.getParams();
      const productId = params.productId;

      // productId가 없거나 유효하지 않은 경우
      if (!productId) {
        setState({
          loading: false,
          error: "상품 ID가 없습니다.",
        });
        return;
      }

      // productId 저장
      setState({ productId });

      // API 호출
      const product = await getProduct(productId);

      // 상품이 없는 경우
      if (!product) {
        setState({
          loading: false,
          error: "상품을 찾을 수 없습니다.",
        });
        return;
      }

      // 데이터 로드 완료
      setState({
        product,
        loading: false,
      });
    } catch (error) {
      console.error("상품 로드 실패:", error);
      setState({
        error: error.message || "상품을 불러오는데 실패했습니다.",
        loading: false,
      });
    }
  },
  children: ({ state, mountChildren }) => {
    const { product } = state;

    // Header는 항상 마운트
    mountChildren(ProductPageHeader, "#product-header");
    mountChildren(Footer, "#footer");

    // 상품 데이터가 있을 때만 나머지 컴포넌트 마운트
    if (product) {
      mountChildren(Breadcrumb, "#breadcrumb", {
        category1: product.category1,
        category2: product.category2,
      });

      mountChildren(ProductDetail, "#product-detail", {
        product,
      });

      mountChildren(RelatedProducts, "#related-products", {
        category2: product.category2,
        currentProductId: product.productId,
      });
    }
  },

  setEvent: ({ addEvent }) => {
    const router = Router();

    // 상품 목록으로 돌아가기 버튼
    addEvent("#go-to-product-list", "click", () => {
      router.push("/");
    });

    // 홈으로 돌아가기 버튼 (에러 상태)
    addEvent("#go-home-btn", "click", () => {
      router.push("/");
    });
  },
});

export default Product;
