import ProductCard from "./ProductCard";
import { LIMIT_OPTIONS, SORT_OPTIONS } from "../constants/filter-constant";
import CategoryFilter from "./CategoryFilter";
import { CategoryViewModel } from "../view-models/CategoryViewModel";

/**
 * @typedef {import('../types.js').ProductListProps} ProductListProps
 */

/**
 * @param {ProductListProps} props
 */
export default function ProductList({ productListResponse, categories = [] }) {
  const products = productListResponse?.products || [];
  const pagination = productListResponse?.pagination || {};
  const filters = productListResponse?.filters || {};

  const selectedCategory1 = filters?.category1 || "";
  const selectedCategory2 = filters?.category2 || "";

  return /* HTML */ `
    <main class="max-w-md mx-auto px-4 py-4">
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input
              type="text"
              id="search-input"
              placeholder="상품명을 검색해보세요..."
              value="${filters.search}"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <!-- 필터 옵션 -->
        <div class="space-y-3">
          <!-- 카테고리 필터 -->
          ${CategoryFilter({ viewModel: new CategoryViewModel(categories, selectedCategory1, selectedCategory2) })}
          <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select
                id="limit-select"
                class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                ${LIMIT_OPTIONS.map(
                  (limit) => `
                <option value="${limit}" ${limit === pagination?.limit ? "selected" : ""}>
                  ${limit}개
                </option>
              `,
                ).join("\n")}
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select
                id="sort-select"
                class="text-sm border border-gray-300 rounded px-2 py-1
                        focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                ${SORT_OPTIONS.map(
                  (sort) => `
                <option value="${sort.value}" ${sort.value === filters?.sort ? "selected" : ""}>
                  ${sort.label}
                </option>
              `,
                ).join("\n")}
              </select>
            </div>
          </div>
        </div>
      </div>
      <!-- 상품 목록 -->
      <div class="mb-6">
        <!-- 상품 개수 정보 -->
        <div class="mb-4 text-sm text-gray-600">
          총 <span class="font-medium text-gray-900">${pagination.total}개</span>의 상품
        </div>
        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          ${products
            .map((product) =>
              ProductCard({
                productId: product.productId,
                image: product.image,
                title: product.title,
                brand: product.brand,
                lprice: product.lprice,
              }),
            )
            .join("\n")}
        </div>

        <div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>
      </div>
    </main>
  `;
}
