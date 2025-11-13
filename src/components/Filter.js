import { store } from "../store/store.js";
import { useEffect } from "../hooks/useEffect.js";
import { getCategories } from "../api/productApi.js";

const fetchCategoriesEffect = () => {
  const { categories } = store.getState();
  if (categories.size === 0) {
    store.setState({ isLoading: true });
    getCategories().then((data) => {
      const newCategories = new Map();

      Object.entries(data).forEach(([key, v]) => {
        const value = Object.keys(v);
        newCategories.set(key, value);
      });

      store.setState({ categories: newCategories, isLoading: false });
    });
  }
};

export const Filter = () => {
  const { isLoading, products } = store.getState();
  const category1List = new Set(products.map((product) => product.category1));

  // 첫 진입 시 카테고리 목록 갱신
  useEffect(fetchCategoriesEffect, []);

  return /*html*/ `
  <div class="space-y-3">
      <!-- 카테고리 필터 -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">카테고리:</label>
          ${Filter.Breadcrumb()}
        </div>
        <!-- 1depth 카테고리 -->
        <div class="flex flex-wrap gap-2">
        ${isLoading ? /*html*/ `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>` : [...category1List, "디지털/가전"].map((category1) => Filter.Category1(category1)).join("")}
        </div>
        <!-- 2depth 카테고리 -->
      </div>
      <!-- 기존 필터들 -->
      <div class="flex gap-2 items-center justify-between">
        <!-- 페이지당 상품 수 -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">개수:</label>
          ${Filter.Limit()}
        </div>
        <!-- 정렬 -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">정렬:</label>
          ${Filter.Sort()}
        </div>
      </div>
    </div>
  `;
};

Filter.Breadcrumb = () => {
  return /*html*/ `
  <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
  `;
};

Filter.Category1 = (category1) => {
  return /*html*/ `
  <button data-category1="${category1}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
      bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
    ${category1}
  </button>
  `;
};

Filter.Limit = () => {
  const pagination = store.getState("pagination");
  const limitList = [10, 20, 50, 100];

  return /*html*/ `
  <select id="limit-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          ${limitList
            .map((limit) => {
              return /*html*/ `
            <option value="${limit}" ${limit === pagination.limit ? "selected" : ""}>
              ${limit}개
            </option>
            `;
            })
            .join("")}
  </select>
  `;
};

Filter.Sort = () => {
  const { sort } = store.getState("filters");
  const sortList = {
    price_asc: "가격 낮은순",
    price_desc: "가격 높은순",
    name_asc: "이름순",
    name_desc: "이름 역순",
  };

  return /*html*/ `
  <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
    ${Object.entries(sortList)
      .map(([key, value]) => {
        return /*html*/ `
        <option value="${key}" ${key === sort ? "selected" : ""}>
          ${value}
        </option>
        `;
      })
      .join("")}
  </select>
  `;
};
