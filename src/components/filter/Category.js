import { store } from "@/store/store.js";
import { Breadcrumb } from "./Breadcrumb";

export const Category = () => {
  const { categories, filters } = store.state;

  const category = () => {
    if (Object.keys(categories).length === 0) {
      return html`
        <!-- 1depth 카테고리 -->
        <div class="flex flex-wrap gap-2">
          <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
        </div>
      `;
    } else {
      return html`
        <!-- 1depth 카테고리 -->
        <div class="flex flex-wrap gap-2">
          ${!filters.category1
            ? `${Object.keys(categories)
                .map(
                  (category) => html`
                    <button
                      data-category1="${category}"
                      class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50 ${category ===
                      filters.category1
                        ? "bg-blue-100 border-blue-300 text-blue-700" // TODO: 컬러 확인 필요
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                    >
                      ${category}
                    </button>
                  `,
                )
                .join("")}`
            : `${Object.keys(categories[filters.category1])
                .map(
                  (category) => html`
                    <button
                      data-category2="${category}"
                      class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${category ===
                      filters.category2
                        ? "bg-blue-100 border-blue-300 text-blue-700" // TODO: 컬러 확인 필요
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                    >
                      ${category}
                    </button>
                  `,
                )
                .join("")}`}
        </div>
      `;
    }
  };

  return html`
    <!-- 필터 옵션 -->
    <div class="space-y-2">
      <!-- 브래드크럼 -->
      ${Breadcrumb()}
      <!-- 필터 카테고리 -->
      ${category()}
    </div>
  `;
};
