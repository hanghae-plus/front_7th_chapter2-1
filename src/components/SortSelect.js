import { store } from "../../store";
import { SORT_OPTIONS } from "../constants/sortOptions.js";

export const SortSelect = () => {
  const { sort = "price_asc" } = store.state;

  return `
  <div class="flex items-center gap-2">
    <label class="text-sm text-gray-600">정렬:</label>
    <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
      focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
      ${SORT_OPTIONS.map(
        ({ value, label }) => `<option value="${value}"${sort === value ? " selected" : ""}>${label}</option>`,
      ).join("")}
    </select>
  </div>
  `;
};
