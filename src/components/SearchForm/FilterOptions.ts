import { LIMIT_OPTIONS, SORT_OPTIONS } from "@/constants";
import { Loading } from "./Loading";
import type { GetProductsParams } from "@/types";

interface FilterOptionsProps {
  loading: boolean;
  params: GetProductsParams;
}

export const FilterOptions = ({ loading, params }: FilterOptionsProps) => {
  const currentLimit = params.limit ?? 20;
  const currentSort = params.sort ?? "price_asc";

  return /* html */ `
    <!-- 필터 옵션 -->
    <div class="space-y-3">
    <!-- 카테고리 필터 -->
        <div class="space-y-2">
            <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">카테고리:</label>
            <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
            </div>
            ${
              loading
                ? `${Loading}`
                : /*html */ `
                <!-- 1depth 카테고리 -->
                <div class="flex flex-wrap gap-2">
                    <button data-category1="생활/건강" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                        bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        생활/건강
                    </button>
                    <button data-category1="디지털/가전" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                        bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        디지털/가전
                    </button>
                </div>
                <!-- 2depth 카테고리 -->`
            }
            
        </div>
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            <select id="limit-select"
                    class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                ${LIMIT_OPTIONS.map(
                  (option) => `
                <option value="${option.value}" ${option.value === currentLimit ? "selected" : ""}>
                ${option.label}
                </option>
            `,
                ).join("")}
            </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>
            <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                            focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                ${SORT_OPTIONS.map(
                  (option) => `
                <option value="${option.value}" ${option.value === currentSort ? "selected" : ""}>${option.label}</option>
            `,
                ).join("")}
            </select>
            </div>
        </div>
    </div>`;
};
