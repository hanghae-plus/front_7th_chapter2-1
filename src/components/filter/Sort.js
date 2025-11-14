export const Sort = () => {
  return html`
    <div class="flex items-center gap-2">
      <label class="text-sm text-gray-600">정렬:</label>
      <select
        id="sort-select"
        class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="price_asc" selected="">가격 낮은순</option>
        <option value="price_desc">가격 높은순</option>
        <option value="name_asc">이름순</option>
        <option value="name_desc">이름 역순</option>
      </select>
    </div>
  `;
};
