import Category from "./Category";
import SearchInput from "./SearchInput";

const options = ({ isSelect, value }) =>
  /*HTML*/ `<option value=${value} ${isSelect ? 'selected=""' : ""}>${value}개</option>`;

const SearchForm = ({ isLoading = true, limit = 20 }) => {
  console.log({ limit });
  return /*html*/ `
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
  ${SearchInput()}
  <!-- 필터 옵션 -->
    <div class="space-y-3">
      <!-- 카테고리 필터 -->
      ${Category({ isLoading })}
      <!-- 기존 필터들 -->
      <div class="flex gap-2 items-center justify-between">
        <!-- 페이지당 상품 수 -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">개수:</label>
          <select id="limit-select"
                  class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                   ${options({ isSelect: limit === "10", value: 10 })}
                   ${options({ isSelect: limit === "20", value: 20 })}
                   ${options({ isSelect: limit === "50", value: 50 })}
                   ${options({ isSelect: limit === "100", value: 100 })}
          </select>
        </div>
        <!-- 정렬 -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">정렬:</label>
          <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                        focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <option value="price_asc" selected="">가격 낮은순</option>
            <option value="price_desc">가격 높은순</option>
            <option value="name_asc">이름순</option>
            <option value="name_desc">이름 역순</option>
          </select>
        </div>
      </div>
    </div>
  </div>`;
};

export default SearchForm;
