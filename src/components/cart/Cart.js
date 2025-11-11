const CartHeader = /*html*/ `
    <!-- 헤더 -->
    <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
        </svg>
        장바구니 
        </h2>
        
        <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        </button>
    </div>
`;
export const Cart = () => {
  return /*html*/ `
        <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
            <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
            ${CartHeader}
            
            <!-- 컨텐츠 -->
            <div class="flex flex-col max-h-[calc(90vh-120px)]">
                <!-- 빈 장바구니 -->
                <div class="flex-1 flex items-center justify-center p-8">
                <div class="text-center">
                    <div class="text-gray-400 mb-4">
                    <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                    </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                    <p class="text-gray-600">원하는 상품을 담아보세요!</p>
                </div>
                </div>
            </div>
            </div>
        </div>
    `;
};
