import { LIMIT_OPTIONS, SORT_OPTIONS } from '@/constants';

export const FilterOptions = ({ pagination, filters }) => {
  return /* HTML */ `
    <div class="flex gap-2 items-center justify-between">
      <!-- 페이지당 상품 수 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select
          id="limit-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          ${LIMIT_OPTIONS.map(
            (option) =>
              `<option value="${option.value}" ${pagination.limit === option.value ? 'selected' : ''}>${option.label}</option>`,
          ).join('')}
        </select>
      </div>
      <!-- 정렬 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">정렬:</label>
        <select
          id="sort-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          ${SORT_OPTIONS.map(
            (option) =>
              `<option value="${option.value}" ${filters.sort === option.value ? 'selected' : ''}>${option.label}</option>`,
          ).join('')}
        </select>
      </div>
    </div>
  `;
};
