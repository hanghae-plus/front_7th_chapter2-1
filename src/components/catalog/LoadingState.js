import { DEFAULT_LIMIT, DEFAULT_SORT } from "../../lib/config/catalog.js";
import { renderSkeletonCards } from "./skeleton.js";
import { renderSpinner } from "./spinner.js";
import { renderFilterPanel } from "./FilterPanel.js";

export const renderLoadingContent = ({
  selectedLimit = DEFAULT_LIMIT,
  selectedSort = DEFAULT_SORT,
  searchValue = "",
  categoryState,
  selectedCategory1 = "",
  selectedCategory2 = "",
} = {}) => `
  ${renderFilterPanel({
    searchValue,
    selectedLimit,
    selectedSort,
    categoryState,
    selectedCategory1,
    selectedCategory2,
  })}
  <div class="mb-6">
    <div class="grid grid-cols-2 gap-4 mb-6">
      ${renderSkeletonCards(4)}
    </div>
    <div class="text-center py-4">
      ${renderSpinner("상품을 불러오는 중...")}
    </div>
  </div>
`;
