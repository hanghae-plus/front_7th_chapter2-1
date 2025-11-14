import { store } from "@/store/store.js";

export const Breadcrumb = () => {
  const {
    filters: { category1, category2 },
  } = store.state;

  return html`
    <div class="flex items-center gap-2">
      <label class="text-sm text-gray-600">카테고리:</label>
      <button data-breadcrumb="reset" class="flex items-center gap-[2px] text-xs hover:text-blue-800 hover:underline">
        전체 ${category1 || ""} ${category2 || ""}
      </button>
    </div>
  `;
};
