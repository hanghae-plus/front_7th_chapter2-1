import App from "./App.js";
import { router } from "./router/Router.js";
import { store } from "./store/store.js";
import { render } from "./render.js";
import { initGlobalEventHandlers, initInputHandlers } from "./eventHandler.js";

// import { getProduct, getCategories } from "./api/productApi.js";
const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function main() {
  // store 변경 시 렌더링 처리
  store.subscribe(() => {
    render(App);
  });

  // 라우터 초기화
  router.init(() => {
    render(App);
  });

  // 초기 렌더링 실행
  render(App);

  // 전역 이벤트 핸들러 등록
  initGlobalEventHandlers();
  initInputHandlers();

  // vv 탬플릿들, 작업 종료 후 삭제 예정 vv

  const 상품목록_레이아웃_카테고리_1Depth = `
    <main class="max-w-md mx-auto px-4 py-4">
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 필터 옵션 -->
        <div class="space-y-3">

          <!-- 카테고리 필터 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button><span class="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="생활/건강" class="text-xs hover:text-blue-800 hover:underline">생활/건강</button>
            </div>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <button data-category1="생활/건강" data-category2="생활용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="문구/사무용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  문구/사무용품
                </button>
              </div>
            </div>
          </div>
          
          <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select id="limit-select"
                      class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">
                  10개
                </option>
                <option value="20" selected="">
                  20개
                </option>
                <option value="50">
                  50개
                </option>
                <option value="100">
                  100개
                </option>
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="price_asc" selected="">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
                <option value="name_asc">이름순</option>
                <option value="name_desc">이름 역순</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  const 상품목록_레이아웃_카테고리_2Depth = `
    <main class="max-w-md mx-auto px-4 py-4">
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 필터 옵션 -->
        <div class="space-y-3">

          <!-- 카테고리 필터 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button><span class="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="생활/건강" class="text-xs hover:text-blue-800 hover:underline">생활/건강</button><span class="text-xs text-gray-500">&gt;</span><span class="text-xs text-gray-600 cursor-default">주방용품</span>
            </div>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <button data-category1="생활/건강" data-category2="생활용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="문구/사무용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  문구/사무용품
                </button>
              </div>
            </div>
          </div>
          
          <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select id="limit-select"
                      class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">
                  10개
                </option>
                <option value="20" selected="">
                  20개
                </option>
                <option value="50">
                  50개
                </option>
                <option value="100">
                  100개
                </option>
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="price_asc" selected="">가격 낮은순</option>
                <option value="price_desc">가격 높은순</option>
                <option value="name_asc">이름순</option>
                <option value="name_desc">이름 역순</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  const 토스트 = `
    <div class="flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
      <div class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <p class="text-sm font-medium">장바구니에 추가되었습니다</p>
        <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
         </svg>
        </div>
        <p class="text-sm font-medium">선택된 상품들이 삭제되었습니다</p>
        <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <p class="text-sm font-medium">오류가 발생했습니다.</p>
        <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  const 장바구니_비어있음 = `
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
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

  const 장바구니_선택없음 = `
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니
            <span class="text-sm font-normal text-gray-600 ml-1">(2)</span>
          </h2>
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          <!-- 전체 선택 섹션 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <label class="flex items-center text-sm text-gray-700">
              <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
              전체선택 (2개)
            </label>
          </div>
          <!-- 아이템 목록 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-4">
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="85067212996">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="85067212996">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg" alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="85067212996">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="85067212996">
                    PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    220원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="2" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="85067212996">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    440원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="85067212996">
                    삭제
                  </button>
                </div>
              </div>
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="86940857379">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="86940857379">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg" alt="샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="86940857379">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="86940857379">
                    샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    230원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="1" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="86940857379">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    230원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="86940857379">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 하단 액션 -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <!-- 선택된 아이템 정보 -->
          <!-- 총 금액 -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-xl font-bold text-blue-600">670원</span>
          </div>
          <!-- 액션 버튼들 -->
          <div class="space-y-2">
            <div class="flex gap-2">
              <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                       hover:bg-gray-700 transition-colors text-sm">
                전체 비우기
              </button>
              <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors text-sm">
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const 장바구니_선택있음 = `
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니
            <span class="text-sm font-normal text-gray-600 ml-1">(2)</span>
          </h2>
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          <!-- 전체 선택 섹션 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <label class="flex items-center text-sm text-gray-700">
              <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
              전체선택 (2개)
            </label>
          </div>
          <!-- 아이템 목록 -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-4">
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="85067212996">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" checked="" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="85067212996">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg" alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="85067212996">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="85067212996">
                    PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    220원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="2" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="85067212996">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="85067212996">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    440원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="85067212996">
                    삭제
                  </button>
                </div>
              </div>
              <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="86940857379">
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500" data-product-id="86940857379">
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img src="https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg" alt="샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="86940857379">
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="86940857379">
                    샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">
                    230원
                  </p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <input type="number" value="1" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="86940857379">
                    <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="86940857379">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    230원
                  </p>
                  <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="86940857379">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 하단 액션 -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <!-- 선택된 아이템 정보 -->
          <div class="flex justify-between items-center mb-3 text-sm">
            <span class="text-gray-600">선택한 상품 (1개)</span>
            <span class="font-medium">440원</span>
          </div>
          <!-- 총 금액 -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-xl font-bold text-blue-600">670원</span>
          </div>
          <!-- 액션 버튼들 -->
          <div class="space-y-2">
            <button id="cart-modal-remove-selected-btn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md 
                       hover:bg-red-700 transition-colors text-sm">
              선택한 상품 삭제 (1개)
            </button>
            <div class="flex gap-2">
              <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                       hover:bg-gray-700 transition-colors text-sm">
                전체 비우기
              </button>
              <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors text-sm">
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.location.pathname.includes("pub")) {
    document.body.innerHTML = `
      <div>상품목록_레이아웃_카테고리_1Depth</div>
      ${상품목록_레이아웃_카테고리_1Depth}
      <br />
      <div>상품목록_레이아웃_카테고리_2Depth</div>
      ${상품목록_레이아웃_카테고리_2Depth}
      <br />
      <div>토스트</div>
      ${토스트}
      <br />
      <div>장바구니_비어있음</div>
      ${장바구니_비어있음}
      <br />
      <div>장바구니_선택없음</div>
      ${장바구니_선택없음}
      <br />
      <div>장바구니_선택있음</div>
      ${장바구니_선택있음}
      <br />

    `;
  }
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
