import { store } from "@/store/store.js";

export const Count = () => {
  const {
    filters: { limit },
  } = store.state;
  const options = [10, 20, 50, 100];

  console.log(limit);

  return html`
    <div class="flex items-center gap-2">
      <label class="text-sm text-gray-600">개수:</label>
      <select
        id="limit-select"
        class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        ${options
          .map((option) => html`<option value="${option}" selected=${option === limit}>${option}개</option>`)
          .join("")}
      </select>
    </div>
  `;
};
