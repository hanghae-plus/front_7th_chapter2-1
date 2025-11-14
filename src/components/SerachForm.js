import { Breadcrumb, Category1DepthButton, Category2DepthActiveButton, Category2DepthButton, SearchBar } from "./index";

export const SearchForm = ({ categories, loading }) => {
  const params = new URLSearchParams(location.search);
  const category1Query = params.get("category1");
  const category2Query = params.get("category2");

  const renderCategoryButton = () => {
    if (category1Query) {
      const targetCategory1List = Object.keys(categories[category1Query]); // 카테고리 2 depth 리스트
      return /* HTML */ `
        ${targetCategory1List
          .map((category2) => {
            if (category2Query === category2) {
              return Category2DepthActiveButton({ category1: category1Query, category2 });
            } else {
              return Category2DepthButton({ category1: category1Query, category2 });
            }
          })
          .join("")}
      `;
    } else {
      return /* HTML */ `
        ${Object.keys(categories)
          .map((category1) => Category1DepthButton({ category1 }))
          .join("")}
      `;
    }
  };

  return /* HTML */ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      <div class="mb-4">${SearchBar()}</div>
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">카테고리:</label>
            ${Breadcrumb({ params })}
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              ${loading
                ? /* HTML */ `
                    <!-- 1depth 카테고리 -->
                    <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
                  `
                : /* HTML */ ` ${renderCategoryButton()} `}
            </div>
          </div>
        </div>
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            <select
              id="limit-select"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10개</option>
              <option value="20" selected>20개</option>
              <option value="50">50개</option>
              <option value="100">100개</option>
            </select>
          </div>
          <!-- 정렬 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>
            <select
              id="sort-select"
              class="text-sm border border-gray-300 rounded px-2 py-1
                            focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="price_asc" selected="">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
              <option value="name_asc">이름순</option>
              <option value="name_desc">이름 역순</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
};
