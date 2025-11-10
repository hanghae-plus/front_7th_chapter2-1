import { CategoryFilter, LimitSelect, ProductList, Search, SortSelect } from "../components";
import { Layout } from "../layout/Layout";

export const Main = ({ isLoaded, products }) => {
  console.log(products);
  return Layout({
    children: `
      ${Search()}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        ${CategoryFilter()}
        ${LimitSelect()}
        ${SortSelect()}
      </div>
      ${ProductList({ isLoaded, products })}
    `,
  });
};
