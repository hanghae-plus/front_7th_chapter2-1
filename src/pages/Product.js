import { getProduct } from "@/api/productApi";
import Footer from "@/components/common/Footer";
import ProductDetail from "@/components/product/ProductDetail";
import ProductHeader from "@/components/product/ProductHeader";
import Breadcrumb from "@/components/product/Breadcrumb";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Component } from "@/core/Component";
import { Router } from "@/core/Router";

// 로딩 템플릿
const LoadingTemplate = () => /* HTML */ `
  <div class="py-20 bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">상품 정보를 불러오는 중...</p>
    </div>
  </div>
`;

// 에러 템플릿 (페이지 레벨 - 전체 화면)
const ErrorTemplate = ({ message }) => /* HTML */ `
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center px-4">
      <!-- 에러 아이콘 -->
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- 에러 메시지 -->
      <h1 class="text-xl font-bold text-gray-900 mb-2">문제가 발생했습니다</h1>
      <p class="text-gray-600 mb-6">${message}</p>

      <!-- 네비게이션 버튼 -->
      <div class="flex gap-2 justify-center">
        <button
          id="go-back-btn"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          이전 페이지
        </button>
        <button
          id="go-home-btn"
          class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          홈으로
        </button>
      </div>
    </div>
  </div>
`;

// 상품 상세 컨텐츠 템플릿
const ProductContentTemplate = () => /* HTML */ `
  <!-- 브레드크럼 -->
  <div id="breadcrumb"></div>
  <!-- 상품 상세 정보 -->
  <div id="product-detail" class="mb-6"></div>
  <!-- 상품 목록으로 이동 -->
  <div class="mb-6">
    <button
      id="go-to-product-list"
      class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
    >
      상품 목록으로 돌아가기
    </button>
  </div>
  <!-- 관련 상품 -->
  <div id="related-products"></div>
`;

const Product = Component({
  template: ({ state }) => {
    const { loading, error } = state;

    // 메인 컨텐츠 결정
    let mainContent;
    if (loading) {
      mainContent = LoadingTemplate();
    } else if (error) {
      mainContent = ErrorTemplate({ message: error });
    } else {
      mainContent = ProductContentTemplate();
    }

    return /* HTML */ `
      <div class="min-h-screen bg-gray-50">
        <div id="product-header"></div>
        <main class="max-w-md mx-auto px-4 py-4">${mainContent}</main>
        <footer id="footer" class="bg-white shadow-sm sticky top-0 z-40"></footer>
      </div>
    `;
  },

  initialState: () => ({
    product: null,
    productId: null,
    loading: true,
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
        router.push("/404", true);
        return;
      }

      // productId 저장
      setState({ productId });

      // API 호출
      const product = await getProduct(productId);

      console.log(product);

      // 상품이 없는 경우
      if (product.error) {
        setState({
          error: "상품을 찾을 수 없습니다.",
          loading: false,
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
        error: "상품을 불러오는데 실패했습니다.",
        loading: false,
      });
    }
  },
  children: ({ state, mountChildren }) => {
    const { product } = state;

    // Header는 항상 마운트
    mountChildren(ProductHeader, "#product-header");
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

    // 상품 목록으로 돌아가기 버튼 (정상 상태)
    addEvent("#go-to-product-list", "click", () => {
      router.push("/");
    });

    // 이전 페이지로 돌아가기 버튼 (에러 상태)
    addEvent("#go-back-btn", "click", () => {
      window.history.back();
    });

    // 홈으로 돌아가기 버튼 (에러 상태)
    addEvent("#go-home-btn", "click", () => {
      router.push("/");
    });
  },
});

export default Product;
