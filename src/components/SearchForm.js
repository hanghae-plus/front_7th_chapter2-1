import OptionSelect from "./formControls/OptionSelect";
import SearchInput from "./formControls/SearchInput";
import { qtySelectData, sortSelectData } from "../constants/selectData";

const CategoryFillter = (categories, loading = false) => {
  return /*html*/ `
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
      </div>
      <!-- 1depth 카테고리 -->
      <div class="flex flex-wrap gap-2">
      ${
        loading
          ? `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`
          : Object.keys(categories)
              .map(
                (
                  category1,
                ) => `<button data-category1="${category1}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              ${category1}
            </button>`,
              )
              .join("")
      }
      </div>
    </div>
  `;
};

export const SearchForm = ({ filters, pagination, categories, loading }) => {
  return /*html*/ `
    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      ${SearchInput()}
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        ${CategoryFillter(categories, loading)}
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            ${OptionSelect("limit-select", { options: qtySelectData, selected: pagination?.limit })}
          </div>
          <!-- 정렬 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>  
            ${OptionSelect("sort-select", { options: sortSelectData, selected: filters?.sort })}
          </div>
        </div>
      </div>
    </div>
  `;
};

export default SearchForm;
