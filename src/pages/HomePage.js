import PageLayout from "../layouts/PageLayout";
import ProductList from "../components/ProductList";

const 상품목록_레이아웃_로딩 = /* html */ `
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
            <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
          </div>
          <!-- 1depth 카테고리 -->
          <div class="flex flex-wrap gap-2">
            <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
          </div>
          <!-- 2depth 카테고리 -->
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
    <!-- 상품 목록 -->
    <div class="mb-6">
      <div>
        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          <!-- 로딩 스켈레톤 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <div class="text-center py-4">
          <div class="inline-flex items-center">
            <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
          </div>
        </div>
      </div>
    </div>
  </main>
`;

export default function HomePage({ loading, response }) {
  if (loading) {
    return PageLayout({ children: 상품목록_레이아웃_로딩 });
  }
  return PageLayout({ children: ProductList({ response }) });
}
