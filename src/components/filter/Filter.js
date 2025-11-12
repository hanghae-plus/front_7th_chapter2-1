import { Category, Count, Search, Sort } from "@/components/filter/index.js";

export const Filter = () => {
  return html`
    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      ${Search()}
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        ${Category()}
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          ${Count()}
          <!-- 정렬 -->
          ${Sort()}
        </div>
      </div>
    </div>
  `;
};
