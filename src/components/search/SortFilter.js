/**
 * 정렬 및 개수 필터 컴포넌트
 * @param {Object} props
 * @param {string} props.sort - 현재 정렬 방식
 * @param {number} props.limit - 현재 페이지당 상품 수
 */
export const SortFilter = ({ sort = "price_asc", limit = 20 } = {}) => {
  const limitOptions = [
    { value: 10, label: "10개" },
    { value: 20, label: "20개" },
    { value: 50, label: "50개" },
    { value: 100, label: "100개" },
  ];

  const sortOptions = [
    { value: "price_asc", label: "가격 낮은순" },
    { value: "price_desc", label: "가격 높은순" },
    { value: "name_asc", label: "이름순" },
    { value: "name_desc", label: "이름 역순" },
  ];

  return `
    <div class="flex gap-2 items-center justify-between">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select
          id="limit-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          ${limitOptions
            .map(
              (option) => `
            <option value="${option.value}" ${Number(limit) === option.value ? 'selected=""' : ""}>
              ${option.label}
            </option>
          `,
            )
            .join("")}
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">정렬:</label>
        <select
          id="sort-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          ${sortOptions
            .map(
              (option) => `
            <option value="${option.value}" ${sort === option.value ? 'selected=""' : ""}>
              ${option.label}
            </option>
          `,
            )
            .join("")}
        </select>
      </div>
    </div>
  `;
};
