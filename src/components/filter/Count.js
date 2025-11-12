export const Count = () => {
  return html`
    <div class="flex items-center gap-2">
      <label class="text-sm text-gray-600">개수:</label>
      <select
        id="limit-select"
        class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="10">10개</option>
        <option value="20" selected="">20개</option>
        <option value="50">50개</option>
        <option value="100">100개</option>
      </select>
    </div>
  `;
};
