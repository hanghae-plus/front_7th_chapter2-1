import productStore from "../Store/product.js";
import { cartStore } from "../Store/cart.js";
import { toastStore } from "../Store/toast.js";
import { router } from "../Router/router.js";
import DetailBreadcrumb from "../components/product/detail/Breadcrumb.js";
import ProductInfo from "../components/product/detail/ProductInfo.js";
import RelatedProducts from "../components/product/detail/RelatedProducts.js";

let eventsInitialized = false;
let quantity = 1;

/**
 * 상품 상세 정보 렌더링
 * @param {object} detail - 현재 상품의 상세 정보
 * @param {Array} products - 관련 상품 후보 목록
 */
function renderProductDetail(detail, products) {
  quantity = 1; // 상세 페이지 진입 시 수량을 1로 초기화

  // 현재 상품을 제외한 관련 상품 목록 생성 (최대 20개)
  const relatedProducts = products.filter((p) => p.productId !== detail.productId).slice(0, 20);
  console.log("relatedProducts", relatedProducts);

  return `
    ${DetailBreadcrumb(detail)}
    ${ProductInfo(detail, quantity)}
    ${RelatedProducts(relatedProducts)}
  `;
}

function render() {
  const pageContainer = document.getElementById("product-detail-page");
  if (!pageContainer) return;

  const { productDetail, products } = productStore.getState();
  const { loading, data, error } = productDetail;

  if (loading) {
    pageContainer.innerHTML = `
      <div class="py-20 bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    `;
  } else if (error) {
    pageContainer.innerHTML = `
      <div class="text-center py-10">
        <p class="text-red-500 font-bold">데이터를 불러오는데 실패했습니다.</p>
        <p class="text-gray-500 text-sm mb-4">${error}</p>
        <button id="retry-fetch" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">재시도</button>
      </div>
    `;
  } else if (data) {
    pageContainer.innerHTML = renderProductDetail(data, products);
  }
}

function setupEventListeners(productId) {
  if (eventsInitialized) return;

  document.body.addEventListener("click", (e) => {
    const pageContainer = e.target.closest("#product-detail-page");
    if (!pageContainer) return;

    // 재시도 버튼
    if (e.target.id === "retry-fetch") {
      productStore.fetchProductById(productId);
      return;
    }

    // 수량 조절
    const quantityInput = document.getElementById("quantity-input");
    if (quantityInput) {
      const stock = parseInt(quantityInput.max, 10);
      if (e.target.closest("#quantity-increase") && quantity < stock) {
        quantity++;
        quantityInput.value = quantity;
      } else if (e.target.closest("#quantity-decrease") && quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
      }
    }

    // 장바구니 담기
    const addToCartBtn = e.target.closest("#add-to-cart-btn");
    if (addToCartBtn) {
      const { productId: btnProductId } = addToCartBtn.dataset;
      const { data } = productStore.getState().productDetail;
      if (data && data.productId === btnProductId) {
        cartStore.addItem(data, quantity);
        toastStore.showToast("장바구니에 상품이 추가되었습니다.", "success");
      }
      return;
    }

    // 관련 상품 클릭
    const relatedCard = e.target.closest(".related-product-card");
    if (relatedCard) {
      const { productId: relatedProductId } = relatedCard.dataset;
      router.navigate(`/product/${relatedProductId}`);
      return;
    }

    // 목록으로 돌아가기
    if (e.target.closest(".go-to-product-list")) {
      let productObj = productStore.getState().productDetail.data;
      console.log("상품목록 돌아가기", productObj);
      router.navigate(`/?category1=${productObj.category1 || ""}&category2=${productObj.category2 || ""}`);
      // window.history.back();
      return;
    }

    // 브레드크럼 클릭
    const breadcrumb = e.target.closest(".breadcrumb-link");
    if (breadcrumb) {
      const { category1, category2 } = breadcrumb.dataset;
      router.navigate(`/?category1=${category1 || ""}&category2=${category2 || ""}`);
      return;
    }
  });

  eventsInitialized = true;
}

export function ProductDetailPage({ params }) {
  const onMount = () => {
    console.log("ProductDetailPage onMount, params:", params);
    setupEventListeners(params.id);
    const unsubscribe = productStore.subscribe(render);

    // 1. 현재 상품 상세 정보 가져오기
    productStore.fetchProductById(params.id).then(() => {
      // 2. 상세 정보 로드 후, 관련 상품 목록 가져오기
      const { data: productDetail } = productStore.getState().productDetail;
      if (productDetail) {
        productStore.setParams({
          // category1: productDetail.category1,
          category2: productDetail.category2,
          limit: 20, // 현재 상품 포함 20개
        });
      }
    });

    return () => {
      unsubscribe();
    };
  };

  return {
    html: `<main id="product-detail-page" class="max-w-md mx-auto px-4 py-4"></main>`,
    onMount,
  };
}
