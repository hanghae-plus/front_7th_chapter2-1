/**
 * @typedef {import('../../types/product.type.js').Product} Product
 */

/**
 * 상품 카드 element 반환
 * @param {Product} product - 상품 정보
 * @returns {string} 상품 카드 element
 */
export const ProductItem = (product) => {
  const { title, image, lprice, productId } = product;
  // 1. 첫 화면 router 로 렌더링될 컴포넌트 호출
  // 2. 컴포넌트 생성하는 함수 호출됨
  // 2-1. mount함수 호출해서 store에 subscribe 등록됨 -> mount 어디서 ?
  // 2-2. state 변경 시 render함수 호출되서 화면 렌더링
  // 3. 컴포넌트 생성하는 함수에서 상품 목록 조회 API 호출 + 결과로 state 업데이트
  // 4. 상품 목록 state 변경되면서 화면 다시 렌더링
  // 5. 페이지 이동 시 unmount함수 호출해서 store에 subscribe 삭제 -> unmount 어디서 ?

  return html`
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
      data-product-id="${productId}"
    >
      <!-- 상품 이미지 -->
      <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img
          src="${image}"
          alt="${title}"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>
      <!-- 상품 정보 -->
      <div class="p-3">
        <div class="cursor-pointer product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${title}</h3>
          <p class="text-xs text-gray-500 mb-2"></p>
          <p class="text-lg font-bold text-gray-900">${lprice}원</p>
        </div>
        <!-- 장바구니 버튼 -->
        <button
          class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn"
          data-product-id="${productId}"
        >
          장바구니 담기
        </button>
      </div>
    </div>
  `;
};
