import { SearchBar } from "./SearchBar";
import { ProductFilter } from "./ProductFilter";
import { CategoryFilter } from "./CategoryFilter";

export const SearchForm = ({ loading }) => {
  const $el = document.createElement("div");
  $el.className = "bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4";

  $el.appendChild(SearchBar());

  const $filters = document.createElement("div");
  $filters.className = "space-y-3";
  $filters.appendChild(CategoryFilter({ loading }));
  $filters.appendChild(ProductFilter({ loading }));

  $el.appendChild($filters);

  return $el;
};
