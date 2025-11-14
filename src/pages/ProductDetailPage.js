import productStore from "../Store/product.js";
import { cartStore } from "../Store/cart.js";
import { toastStore } from "../Store/toast.js";
import { router } from "../Router/router.js";

let eventsInitialized = false;
let quantity = 1;

/**
 * 상품 상세 정보 렌더링
 * @param {object} product - 상품 상세 정보
 */
function renderProductDetail(product) {
  const detail = product; // 구조분해 대신 직접 할당
  quantity = 1; // 상세 페이지 진입 시 수량을 1로 초기화
  let relatedProducts = [];

  return `
    <!-- 브레드크럼 -->
    <nav class="mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <a href="/" data-link class="hover:text-blue-600 transition-colors">홈</a>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        <button class="breadcrumb-link" data-category1="${detail.category1}">${detail.category1}</button>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        <button class="breadcrumb-link" data-category1="${detail.category1}" data-category2="${detail.category2}">${detail.category2}</button>
      </div>
    </nav>
    <!-- 상품 상세 정보 -->
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="p-4">
        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img src="${detail.image}" alt="${detail.tile}" class="w-full h-full object-cover product-detail-image">
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-1">${detail.brand || ""}</p>
          <h1 class="text-xl font-bold text-gray-900 mb-3">${detail.title}</h1>
          <div class="flex items-center mb-3">
            <!-- 평점 (API에 없으므로 임시) -->
            <span class="ml-2 text-sm text-gray-600">${detail.rating.toFixed(1)} (${detail.reviewCount.toLocaleString()}개 리뷰)</span>
          </div>
          <div class="mb-4">
            <span class="text-2xl font-bold text-blue-600">${detail.lprice.toLocaleString()}원</span>
          </div>
          <div class="text-sm text-gray-600 mb-4">재고 ${detail.stock.toLocaleString()}개</div>
          <div class="text-sm text-gray-700 leading-relaxed mb-6">${detail.description}</div>
        </div>
      </div>
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-gray-900">수량</span>
          <div class="flex items-center">
            <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
            </button>
            <input type="number" id="quantity-input" value="${quantity}" min="1" max="${detail.stock}" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" readonly>
            <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>
        <button id="add-to-cart-btn" data-product-id="${detail.productId}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
          장바구니 담기
        </button>
      </div>
    </div>
    <div class="mb-6">
      <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors go-to-product-list">
        상품 목록으로 돌아가기
      </button>
    </div>
    <!-- 관련 상품 -->
    ${
      relatedProducts && relatedProducts.length > 0
        ? `
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
        <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-2 gap-3 responsive-grid">
          ${relatedProducts
            .map(
              (p) => `
            <div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer" data-product-id="${p.productId}">
              <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" loading="lazy">
              </div>
              <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${p.name}</h3>
              <p class="text-sm font-bold text-blue-600">${p.lprice.toLocaleString()}원</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>
    `
        : ""
    }`;
}

function render() {
  const pageContainer = document.getElementById("product-detail-page");
  if (!pageContainer) return;

  const { loading, data, error } = productStore.getState().productDetail;

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
    pageContainer.innerHTML = renderProductDetail(data);
  }
}

function setupEventListeners() {
  if (eventsInitialized) return;

  document.body.addEventListener("click", (e) => {
    const pageContainer = e.target.closest("#product-detail-page");
    if (!pageContainer) return;

    // 재시도 버튼
    if (e.target.id === "retry-fetch") {
      const { id } = router.getParams();
      productStore.fetchProductById(id);
      return;
    }

    // 수량 조절
    const quantityInput = document.getElementById("quantity-input");
    if (!quantityInput) return;

    const stock = parseInt(quantityInput.max, 10);

    if (e.target.closest("#quantity-increase")) {
      if (quantity < stock) {
        quantity++;
        quantityInput.value = quantity;
      }
    } else if (e.target.closest("#quantity-decrease")) {
      if (quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
      }
    }

    // 장바구니 담기
    const addToCartBtn = e.target.closest("#add-to-cart-btn");
    if (addToCartBtn) {
      const { productId } = addToCartBtn.dataset;
      const { data } = productStore.getState().productDetail;
      if (data && data.productId === productId) {
        cartStore.addItem(data, quantity);
        toastStore.showToast("장바구니에 상품이 추가되었습니다.", "success");
      }
      return;
    }

    // 관련 상품 클릭
    const relatedCard = e.target.closest(".related-product-card");
    if (relatedCard) {
      const { productId } = relatedCard.dataset;
      router.navigate(`/product/${productId}`);
      return;
    }

    // 목록으로 돌아가기
    if (e.target.closest(".go-to-product-list")) {
      window.history.back();
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
    setupEventListeners();
    const unsubscribe = productStore.subscribe(render);
    productStore.fetchProductById(params.id);

    return () => {
      unsubscribe();
      // 페이지를 떠날 때 이벤트 리스너를 제거하지 않음 (body에 위임했으므로)
      // eventsInitialized = false; // 필요 시 페이지별로 리스너 재설정
    };
  };

  return {
    html: `<main id="product-detail-page" class="max-w-md mx-auto px-4 py-4"></main>`,
    onMount,
  };
}
