import { store } from "../../store";

export const CategoryFilter = () => {
  const { isLoaded, categories, category1, category2 } = store.state;

  const selectedCategory1 = category1 || "";
  const selectedCategory2 = category2 || "";

  return `
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <label class="text-sm text-gray-600">카테고리:</label>
      <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline ${!selectedCategory1 && !selectedCategory2 ? "text-blue-600 font-semibold" : ""}">전체</button>
    </div>
    ${
      isLoaded && categories && Object.keys(categories).length > 0
        ? `
        <!-- 1depth 카테고리 -->
        <div class="flex flex-wrap gap-2">
          ${Object.keys(categories)
            .map(
              (cat1) =>
                `
          <button data-category1="${cat1}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
              ${selectedCategory1 === cat1 ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}">
            ${cat1}
          </button>
          `,
            )
            .join("")}
        </div>
        ${
          selectedCategory1 && categories[selectedCategory1] && Object.keys(categories[selectedCategory1]).length > 0
            ? `
        <!-- 2depth 카테고리 -->
        <div class="flex flex-wrap gap-2 mt-2">
          ${Object.keys(categories[selectedCategory1])
            .map(
              (cat2) =>
                `
          <button data-category2="${cat2}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
              ${selectedCategory2 === cat2 ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}">
            ${cat2}
          </button>
          `,
            )
            .join("")}
        </div>
        `
            : ""
        }
        `
        : `
      <!-- 1depth 카테고리 -->
      <div class="flex flex-wrap gap-2">
        <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
      </div>
      `
    }
  </div>
  `;
};
