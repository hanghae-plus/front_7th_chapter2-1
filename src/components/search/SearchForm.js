import { SearchInput } from "./SearchInput.js";
import { CategoryFilter } from "./CategoryFilter.js";
import { SortFilter } from "./SortFilter.js";

/**
 * 검색 및 필터 폼 컴포넌트
 */
export const SearchForm = () => {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      ${SearchInput()}
      <div class="space-y-3">
        ${CategoryFilter()}
        ${SortFilter()}
      </div>
    </div>
  `;
};
