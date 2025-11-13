import { store } from "../../store";
import { getCategoryButtonClass } from "../utils/componentUtils.js";

/**
 * 브레드크럼 렌더링
 */
const renderBreadcrumb = (selectedCategory1, selectedCategory2) => {
  const items = [];

  // 전체 버튼
  const isAllSelected = !selectedCategory1 && !selectedCategory2;
  items.push(
    `<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline ${
      isAllSelected ? "text-blue-600 font-semibold" : ""
    }">전체</button>`,
  );

  // 1차 카테고리
  if (selectedCategory1) {
    items.push(`<span class="text-xs text-gray-500">&gt;</span>`);
    items.push(
      `<button class="breadcrumb-link text-xs hover:text-blue-800 hover:underline cursor-pointer" data-category1="${selectedCategory1}">${selectedCategory1}</button>`,
    );
  }

  // 2차 카테고리
  if (selectedCategory2) {
    items.push(`<span class="text-xs text-gray-500">&gt;</span>`);
    items.push(`<span class="text-xs text-gray-600 cursor-default">${selectedCategory2}</span>`);
  }

  return items.join("");
};

/**
 * 1차 카테고리 버튼 렌더링
 * 전체 선택 시에만 노출 (1depth 선택 시 숨김)
 */
const renderCategory1Buttons = (categories, selectedCategory1) => {
  // 1depth가 선택되어 있으면 버튼 숨김
  if (selectedCategory1) {
    return "";
  }

  if (!categories || Object.keys(categories).length === 0) {
    return `
      <div class="flex flex-wrap gap-2">
        <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
      </div>
    `;
  }

  return `
    <div class="flex flex-wrap gap-2">
      ${Object.keys(categories)
        .map(
          (cat1) => `
        <button data-category1="${cat1}" class="${getCategoryButtonClass(false, "category1")}">
          ${cat1}
        </button>
      `,
        )
        .join("")}
    </div>
  `;
};

/**
 * 2차 카테고리 버튼 렌더링
 */
const renderCategory2Buttons = (categories, selectedCategory1, selectedCategory2) => {
  if (!selectedCategory1 || !categories[selectedCategory1] || Object.keys(categories[selectedCategory1]).length === 0) {
    return "";
  }

  return `
    <div class="flex flex-wrap gap-2 mt-2">
      ${Object.keys(categories[selectedCategory1])
        .map(
          (cat2) => `
        <button data-category2="${cat2}" class="${getCategoryButtonClass(selectedCategory2 === cat2, "category2")}">
          ${cat2}
        </button>
      `,
        )
        .join("")}
    </div>
  `;
};

export const CategoryFilter = () => {
  const { categories, category1, category2 } = store.state;

  const selectedCategory1 = category1 || "";
  const selectedCategory2 = category2 || "";

  return `
  <div class="space-y-2">
    <div class="flex items-center gap-2 flex-wrap">
      <label class="text-sm text-gray-600">카테고리:</label>
      ${renderBreadcrumb(selectedCategory1, selectedCategory2, categories)}
    </div>
    ${renderCategory1Buttons(categories, selectedCategory1)}
    ${renderCategory2Buttons(categories, selectedCategory1, selectedCategory2)}
  </div>
  `;
};
