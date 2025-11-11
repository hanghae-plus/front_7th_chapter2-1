import { store } from "../../store";

const LIMIT_OPTIONS = [{ value: "10" }, { value: "20" }, { value: "50" }, { value: "100" }];

export const LimitSelect = () => {
  const { limit = "20" } = store.state;

  return `
  <div class="flex items-center gap-2">
    <label class="text-sm text-gray-600">개수:</label>
    <select id="limit-select"
      class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
      ${LIMIT_OPTIONS.map(
        ({ value }) => `<option value="${value}"${limit === value ? " selected" : ""}>${value}개</option>`,
      ).join("")}
    </select>
  </div>
  `;
};
