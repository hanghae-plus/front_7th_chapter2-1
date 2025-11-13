const DetailImage = ({ image, title }) => {
  return /*HTML*/ `
        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img src=${image} alt=${title} class="w-full h-full object-cover product-detail-image">
        </div>`;
};

const FilledStar = /*HTML*/ `<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>`;

const EmptyStar = /*HTML*/ `<svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>`;

const ItemReview = ({ rating, reviewCount }) => {
  const leftStar = 5 - rating;
  return /*HTML*/ `       
            <div class="flex items-center mb-3">
              <div class="flex items-center">
               ${FilledStar.repeat(rating)}             
               ${EmptyStar.repeat(leftStar)}   
              </div>
              <span class="ml-2 text-sm text-gray-600">${rating}.0 (${reviewCount}개 리뷰)</span>
            </div>`;
};

const Price = ({ price }) => {
  return /*HTML*/ ` <div class="mb-4">
              <span class="text-2xl font-bold text-blue-600">${price.toLocaleString()}원</span>
            </div>`;
};

const Stock = ({ stock }) => {
  return /*HTML*/ ` <div class="text-sm text-gray-600 mb-4">
              재고 ${stock}개
            </div>`;
};

const Description = ({ description }) => {
  return /*HTML*/ ` <div class="text-sm text-gray-700 leading-relaxed mb-6">
              ${description}
            </div>`;
};

const Counter = () => {
  return /*HTML*/ `
            <div class="flex items-center">
              <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300 
                 rounded-l-md bg-gray-50 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <input type="number" id="quantity-input" value="1" min="1" max="107" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 
                focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300 
                 rounded-r-md bg-gray-50 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            </div>`;
};

const AddToCartButton = ({ product }) => {
  return /*HTML*/ `<button id="add-to-cart-btn" 
               data-product-id="${product.productId}"
               data-product-title="${product.title}"
               data-product-image="${product.image}"
               data-product-lprice="${product.lprice}"
               class="w-full bg-blue-600 text-white py-3 px-4 rounded-md 
               hover:bg-blue-700 transition-colors font-medium">
            장바구니 담기
          </button>`;
};

export const DetailInfo = ({ product }) => {
  return /*HTML*/ `   
      <!-- 상품 상세 정보 -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <!-- 상품 이미지 -->
        <div class="p-4">
        ${DetailImage({ image: product.image, title: product.title })}
          <!-- 상품 정보 -->
          <div>
            <p class="text-sm text-gray-600 mb-1">${product.maker || product.brand}</p>
            <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
            ${ItemReview({ rating: product.rating, reviewCount: product.reviewCount })}
            ${Price({ price: product.lprice })}
            ${Stock({ stock: product.stock })}
            ${Description({ description: product.description })}
          </div>
        </div>
        <!-- 수량 선택 및 액션 -->
        <div class="border-t border-gray-200 p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-900">수량</span>
            ${Counter()}
          </div>
          ${AddToCartButton({ product })}
        </div>
      </div>`;
};
