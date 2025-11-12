import {
  SearchInput,
  CategoryBreadcrumb,
  CategoryButtons,
  FilterOptions,
} from '@/components';

export const SearchForm = ({
  pagination = { limit: 20 },
  filters = { sort: 'price_asc', search: '' },
  categories,
}) => {
  return /* HTML */ `
    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      <div class="mb-4">${SearchInput({ value: filters.search })}</div>
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        <div class="space-y-2">
          ${CategoryBreadcrumb({
            category1: filters.category1,
            category2: filters.category2,
          })}
          ${CategoryButtons({
            categories,
            category1: filters.category1,
            category2: filters.category2,
          })}
        </div>
        ${FilterOptions({ pagination, filters })}
      </div>
    </div>
  `;
};
