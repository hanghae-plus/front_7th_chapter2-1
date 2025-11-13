import { SearchInput } from "./SearchInput";
import { FilterOptions } from "./FilterOptions";
import type { GetProductsParams } from "@/types";

interface SearchFormProps {
  loading: boolean;
  params: GetProductsParams;
}

export const SearchForm = ({ loading, params }: SearchFormProps) => {
  return /* html */ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      ${SearchInput}
      ${FilterOptions({ loading, params })}
    </div>
  `;
};
