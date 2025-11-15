import { ProductItem, ProductItemSkeleton } from "./ProductItem";
import { ProductListError } from "../../error/ProductListError.js";

const Loading = /*HTML*/ `
        <div class="text-center py-4">
          <div class="inline-flex items-center">
            <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
          </div>
        </div>`;

export const ProductList = ({
  loading,
  products = [],
  pagination = { total: 0, page: 1, totalPages: 1 },
  error = null,
}) => {
  // 에러 상태 처리
  if (error) {
    return /*HTML*/ `
      <div class="mb-6">
        ${ProductListError({ error })}
      </div>
    `;
  }

  const hasMore = pagination.page < pagination.totalPages;
  const isLoadingMore = loading && products.length > 0; // 무한 스크롤 로딩 중
  const isInitialLoading = loading && products.length === 0; // 초기 로딩 중

  return /*HTML*/ `   
    <div class="mb-6">
      <div>
        <!-- 상품 그리드 -->
        ${
          isInitialLoading
            ? ` <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                ${ProductItemSkeleton.repeat(8)}
                </div>  
                 ${Loading}`
            : ` 
            <!-- 상품 개수 정보 -->
            <div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">${pagination.total}개</span>의 상품
            </div>
        
        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            ${products.map((product) => ProductItem({ product })).join("")}
        </div>
        
        <!-- Intersection Observer Sentinel (로딩 중이 아닐 때만) -->
        ${hasMore && !isLoadingMore ? `<div id="infinite-scroll-sentinel" style="height: 40px;"></div>` : ""}
        
        <!-- 로딩 UI -->
        ${
          isLoadingMore || hasMore
            ? `<div class="text-center py-4">
          <div class="inline-flex items-center">
            <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">${isLoadingMore ? "상품을 불러오는 중..." : "더 보기..."}</span>
          </div>
        </div>`
            : `<div class="text-center py-4 text-sm text-gray-500">
                모든 상품을 확인했습니다
              </div>`
        }
        
        `
        }
       
      </div>
    </div>`;
};
