const Rate = (rating) =>
  /*HTML*/ `
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
`.repeat(rating) +
  /*HTML*/ `
    <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
`.repeat(5 - rating);

const Product = ({ product, quantity }) => {
  return /*html*/ `
  <div class="bg-white rounded-lg shadow-sm mb-6">
  <!-- 상품 이미지 -->
  <div class="p-4">
    <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
      <img src="${product.image}" alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장" class="w-full h-full object-cover product-detail-image">
    </div>
    <!-- 상품 정보 -->
    <div>
      <p class="text-sm text-gray-600 mb-1"></p>
      <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
      <!-- 평점 및 리뷰 -->
      <div class="flex items-center mb-3">
        ${Rate(product.rating)}
        <span class="ml-2 text-sm text-gray-600">${product.rating} (${product.reviewCount}개 리뷰)</span>
      </div>
      <!-- 가격 -->
      <div class="mb-4">
        <span class="text-2xl font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</span>
      </div>
      <!-- 재고 -->
      <div class="text-sm text-gray-600 mb-4">
        재고 ${product.stock}개
      </div>
      <!-- 설명 -->
      <div class="text-sm text-gray-700 leading-relaxed mb-6">
        ${product.description}
      </div>
    </div>
  </div>
  
  <!-- 수량 선택 및 액션 -->
  <div class="border-t border-gray-200 p-4">
    <div class="flex items-center justify-between mb-4">
      <span class="text-sm font-medium text-gray-900">수량</span>
      <div class="flex items-center">
        <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300
           rounded-l-md bg-gray-50 hover:bg-gray-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>
        <input type="number" id="quantity-input" value="${quantity}" min="1" max="107" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300
          focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
        <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300
           rounded-r-md bg-gray-50 hover:bg-gray-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>
    </div>
    <!-- 액션 버튼 -->
    <button id="add-to-cart-btn" data-product-id="85067212996" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md
         hover:bg-blue-700 transition-colors font-medium">
      장바구니 담기
    </button>
  </div>
</div>
  `;
};

export default Product;
