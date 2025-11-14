import { getProduct, getProducts } from "../api/productApi.js";
import { AddToCartBtn } from "../components/cart/addToCartBtn.js";
import { QuantitySelector, initQuantitySelector } from "../components/common/QuantitySelector.js";

export const ItemDetailPage = (productId) => {
  // 에러 페이지 컴포넌트
  const renderErrorPage = (message, buttonText, buttonAction) => {
    return /*html*/ `
      <div class="py-20 bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <p class="text-red-600 mb-4">${message}</p>
          ${buttonAction}
        </div>
      </div>
    `;
  };

  // 로딩 상태의 content
  const loadingContent = /*html*/ `
        <div class="py-40 bg-gray-50 flex items-center justify-center min-h-[100vh]">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
    `;

  // 평점 별 생성
  const STAR_SVG_PATH =
    "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);
    let starsHTML = "";

    for (let i = 0; i < fullStars; i++) {
      starsHTML += `<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="${STAR_SVG_PATH}"></path></svg>`;
    }

    if (hasHalfStar) {
      starsHTML += `<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="${STAR_SVG_PATH}"></path></svg>`;
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHTML += `<svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="${STAR_SVG_PATH}"></path></svg>`;
    }

    return starsHTML;
  };

  // 상품 정보 컴포넌트
  const ProductInfo = (product) => {
    return /*html*/ `
      <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover product-detail-image">
      </div>
      <!-- 상품 정보 -->
      <div>
        ${product.brand ? `<p class="text-sm text-gray-600 mb-1">${product.brand}</p>` : ""}
        <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
        <!-- 평점 및 리뷰 -->
        <div class="flex items-center mb-3">
          <div class="flex items-center">
            ${renderStars(product.rating || 0)}
          </div>
          <span class="ml-2 text-sm text-gray-600">${(product.rating || 0).toFixed(1)} (${product.reviewCount || 0}개 리뷰)</span>
        </div>
        <!-- 가격 -->
        <div class="mb-4">
          <span class="text-2xl font-bold text-blue-600">${parseInt(product.lprice || 0).toLocaleString()}원</span>
        </div>
        <!-- 재고 -->
        <div class="text-sm text-gray-600 mb-4">
          재고 ${product.stock || 0}개
        </div>
        <!-- 설명 -->
        <div class="text-sm text-gray-700 leading-relaxed mb-6">
          ${product.description || ""}
        </div>
      </div>
    `;
  };

  // 관련 상품 컴포넌트
  const RelatedProducts = (products, currentProductId) => {
    // 현재 상품을 제외한 전체 상품
    const filteredProducts = products.filter((product) => product.productId !== currentProductId);

    if (filteredProducts.length === 0) {
      return /*html*/ `
        <div class="p-4 text-center text-gray-500" id="products-grid" data-testid="products-grid">
          <p class="text-sm">관련 상품이 없습니다.</p>
        </div>
      `;
    }

    return /*html*/ `
      <div class="grid grid-cols-2 gap-3 responsive-grid" id="products-grid" data-testid="products-grid">
        ${filteredProducts
          .map(
            (product) => `
          <div class="bg-gray-50 rounded-lg p-3 related-product-card product-card cursor-pointer" data-product-id="${product.productId}">
            <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
              <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${product.title}</h3>
            <p class="text-sm font-bold text-blue-600 mb-2">${parseInt(product.lprice || 0).toLocaleString()}원</p>
            ${AddToCartBtn(product, 1, "small")}
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  };

  // 브레드크럼 화살표 SVG
  const BREADCRUMB_ARROW_SVG = `<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;

  // 상품 정보를 렌더링하는 함수
  const renderProductContent = (product) => {
    return /*html*/ `
        <!-- 브레드크럼 -->
        <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
            ${BREADCRUMB_ARROW_SVG}
            ${
              product.category1
                ? `<button class="breadcrumb-link" data-category1="${product.category1}">${product.category1}</button>`
                : ""
            }
            ${
              product.category2
                ? `${BREADCRUMB_ARROW_SVG}<button class="breadcrumb-link" data-category2="${product.category2}">${product.category2}</button>`
                : ""
            }
          </div>
        </nav>
        <!-- 상품 상세 정보 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <!-- 상품 이미지 -->
          <div class="p-4">
            ${ProductInfo(product)}
          </div>
          <!-- 수량 선택 및 액션 -->
          <div class="border-t border-gray-200 p-4">
            ${QuantitySelector({
              max: product.stock || 1,
            })}
            <!-- 액션 버튼 -->
            ${AddToCartBtn(product, 1, "default", "add-to-cart-btn")}
          </div>
        </div>
        <!-- 상품 목록으로 이동 -->
        <div class="mb-6">
          <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
            hover:bg-gray-200 transition-colors go-to-product-list">
            상품 목록으로 돌아가기
          </button>
        </div>
        <!-- 관련 상품 -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div class="p-4" id="related-products-container">
            <div class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
    `;
  };

  return {
    content: loadingContent,
    headerOptions: {
      showBackButton: true,
      isTitleLink: false,
      title: "상품 상세",
    },
    init: async () => {
      const mainElement = document.querySelector("main");
      if (!mainElement) return;

      if (!productId) {
        mainElement.innerHTML = renderErrorPage(
          "상품 ID가 제공되지 않았습니다.",
          "홈으로 돌아가기",
          '<a href="/" data-link="" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">홈으로 돌아가기</a>',
        );
        return;
      }

      try {
        // 상품 정보 API 호출
        const product = await getProduct(productId);

        // 상품 정보로 content 업데이트
        mainElement.innerHTML = renderProductContent(product);

        // QuantitySelector 이벤트 리스너 설정
        const maxStock = product.stock || 1;
        const addToCartBtn = document.querySelector("#add-to-cart-btn");
        const quantitySelector = initQuantitySelector("quantity", {
          max: maxStock,
          onQuantityChange: (quantity) => {
            // 장바구니 담기 버튼의 data-quantity 속성 업데이트
            if (addToCartBtn) {
              addToCartBtn.setAttribute("data-quantity", quantity);
            }
          },
        });

        // 장바구니 담기 완료 후 수량 리셋 (이벤트 콜백으로 처리)
        if (addToCartBtn && quantitySelector) {
          addToCartBtn.addEventListener("cart:itemAdded", () => {
            quantitySelector.setQuantity(1);
          });
        }

        // 관련 상품 조회
        const relatedProductsContainer = document.getElementById("related-products-container");
        if (relatedProductsContainer) {
          try {
            const relatedProductsParams = {
              limit: 100,
              ...(product.category1 && { category1: product.category1 }),
              ...(product.category2 && { category2: product.category2 }),
            };

            const relatedProductsResponse = await getProducts(relatedProductsParams);
            const relatedProducts = relatedProductsResponse.products || [];

            // 관련 상품 렌더링
            relatedProductsContainer.innerHTML = RelatedProducts(relatedProducts, product.productId);
          } catch (error) {
            console.error("관련 상품을 불러오는 중 오류가 발생했습니다:", error);
            relatedProductsContainer.innerHTML = /*html*/ `
              <div class="p-4 text-center text-gray-500">
                <p class="text-sm">관련 상품을 불러올 수 없습니다.</p>
              </div>
            `;
          }
        }
      } catch (error) {
        console.error("상품 정보를 불러오는 중 오류가 발생했습니다:", error);
        mainElement.innerHTML = renderErrorPage(
          "상품 정보를 불러오는 중 오류가 발생했습니다.",
          "다시 시도",
          '<button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">다시 시도</button>',
        );
      }
    },
  };
};
