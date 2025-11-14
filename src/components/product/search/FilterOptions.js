export default function FilterOptions({ limit = 20, sort = "price_asc" }) {
  const pageSizeOption = [
    { label: "10개", value: 10 },
    { label: "20개", value: 20 },
    { label: "50개", value: 50 },
    { label: "100개", value: 100 },
  ];
  const sortOption = [
    { label: "가격 낮은순", value: "price_asc" },
    { label: "가격 높은순", value: "price_desc" },
    { label: "이름순", value: "name_asc" },
    { label: "이름 역순", value: "name_desc" },
  ];

  return `
    <div class="flex gap-2 items-center justify-between">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select id="limit-select" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          ${pageSizeOption
            .map((size) => {
              return `<option value="${size.value}" ${
                Number(limit) === size.value ? "selected" : ""
              }>${size.label}</option>`;
            })
            .join("")}
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">정렬:</label>
        <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          ${sortOption
            .map((s) => {
              return `<option value="${s.value}" ${sort === s.value ? "selected" : ""}>${s.label}</option>`;
            })
            .join("")}
        </select>
      </div>
    </div>
  `;
}
