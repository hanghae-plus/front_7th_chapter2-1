import Category from "./Category";
import SearchInput from "./SearchInput";

const options = ({ isSelect, value, label }) =>
  /*HTML*/ `<option value=${value} ${isSelect ? 'selected=""' : ""}>${label}</option>`;

const SearchForm = ({
  isLoading = true,
  categories = {},
  limit = "20",
  sort = "price_asc",
  search = "",
  category1 = "",
  category2 = "",
}) => {
  return /*html*/ `
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
  ${SearchInput({ search })}
  <!-- 필터 옵션 -->
    <div class="space-y-3">
      <!-- 카테고리 필터 -->
      ${Category({ isLoading, categories, category1, category2 })}
      <!-- 기존 필터들 -->
      <div class="flex gap-2 items-center justify-between">
        <!-- 페이지당 상품 수 -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">개수:</label>
          <select id="limit-select"
                  class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                   ${options({ isSelect: limit === "10", label: "10개", value: 10 })}
                   ${options({ isSelect: limit === "20", label: "20개", value: 20 })}
                   ${options({ isSelect: limit === "50", label: "50개", value: 50 })}
                   ${options({ isSelect: limit === "100", label: "100개", value: 100 })}
          </select>
        </div>
        <!-- 정렬 -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">정렬:</label>
          <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                   ${options({ isSelect: sort === "price_asc", label: "가격 낮은순", value: "price_asc" })}
                   ${options({ isSelect: sort === "price_desc", label: "가격 높은순", value: "price_desc" })}
                   ${options({ isSelect: sort === "name_asc", label: "이름순", value: "name_asc" })}
                   ${options({ isSelect: sort === "name_desc", label: "이름 역순", value: "name_desc" })}
          </select>
        </div>
      </div>
    </div>
  </div>`;
};

export default SearchForm;
