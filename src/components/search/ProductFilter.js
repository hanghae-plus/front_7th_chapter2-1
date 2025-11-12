import { store } from "../../store/store";

export const ProductFilter = () => {
  const $el = document.createElement("div");
  $el.className = "flex gap-2 items-center justify-between";

  function render() {
    const { pagination, sort } = store.state;
    $el.innerHTML = /* HTML */ `
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select
          id="limit-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="10" ${pagination.limit === 10 ? "selected" : ""}>10개</option>
          <option value="20" ${pagination.limit === 20 ? "selected" : ""}>20개</option>
          <option value="50" ${pagination.limit === 50 ? "selected" : ""}>50개</option>
          <option value="100" ${pagination.limit === 100 ? "selected" : ""}>100개</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">정렬:</label>
        <select
          id="sort-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="price_asc" ${sort === "price_asc" ? "selected" : ""}>가격 낮은순</option>
          <option value="price_desc" ${sort === "price_desc" ? "selected" : ""}>가격 높은순</option>
          <option value="name_asc" ${sort === "name_asc" ? "selected" : ""}>이름순</option>
          <option value="name_desc" ${sort === "name_desc" ? "selected" : ""}>이름 역순</option>
        </select>
      </div>
    `;
  }

  render();
  store.subscribe(render);
  return $el;
};
