import { SearchInput } from "./SearchInput.js";
import { CategoryFilter } from "./CategoryFilter.js";
import { SortFilter } from "./SortFilter.js";

/**
 * 검색 및 필터 폼 컴포넌트
 * @param {Object} props
 * @param {Object} props.filters - 현재 필터 설정
 * @param {Object} props.categories - 카테고리 데이터
 */
export const SearchForm = ({ filters = {}, categories = {} } = {}) => {
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      ${SearchInput({ value: filters.search || "" })}
      <div class="space-y-3">
        ${CategoryFilter({
          category1: filters.category1,
          category2: filters.category2,
          categories,
        })}
        ${SortFilter({ sort: filters.sort, limit: filters.limit })}
      </div>
    </div>
  `;
};
