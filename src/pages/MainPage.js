import { CategoryFilter, LimitSelect, ProductList, Search, SortSelect } from "../components";
import { Layout } from "../layout/Layout";

export const MainPage = () => {
  return Layout({
    children: `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        ${Search()}
        <div class="space-y-3">
          ${CategoryFilter()}
          <div class="flex gap-2 items-center justify-between">
            ${LimitSelect()}
            ${SortSelect()}
          </div>
        </div>
      </div>
      ${ProductList()}
    `,
  });
};
