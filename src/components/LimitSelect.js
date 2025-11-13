import { store } from "../../store";
import { LIMIT_OPTIONS } from "../constants/limitOptions.js";

export const LimitSelect = () => {
  const { limit = "20" } = store.state;

  return `
  <div class="flex items-center gap-2">
    <label class="text-sm text-gray-600">개수:</label>
    <select id="limit-select"
      class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
      ${LIMIT_OPTIONS.map(
        ({ value, label }) => `<option value="${value}"${limit === value ? " selected" : ""}>${label}</option>`,
      ).join("")}
    </select>
  </div>
  `;
};
