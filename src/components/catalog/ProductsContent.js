import { formatCurrency } from "../../lib/utils/format.js";
import { DEFAULT_LIMIT, DEFAULT_SORT } from "../../lib/config/catalog.js";
import { renderFilterPanel } from "./FilterPanel.js";
import { renderProductsGrid } from "./ProductGrid.js";
import { renderLoadMoreSection } from "./LoadMoreSection.js";

export const renderProductsContent = ({
  products = [],
  pagination,
  selectedLimit = DEFAULT_LIMIT,
  selectedSort = DEFAULT_SORT,
  searchValue = "",
  categoryState,
  selectedCategory1 = "",
  selectedCategory2 = "",
  isLoadingMore = false,
  loadMoreError = null,
} = {}) => {
  const totalProducts = pagination?.total ?? products.length;
  const hasMore = Boolean(pagination?.hasNext);

  return `
    ${renderFilterPanel({
      searchValue,
      selectedLimit,
      selectedSort,
      categoryState,
      selectedCategory1,
      selectedCategory2,
    })}
    <div class="mb-6">
      <div class="mb-4 text-sm text-gray-600">
        총 <span class="font-medium text-gray-900">${formatCurrency(totalProducts)}개</span>의 상품
      </div>
      ${renderProductsGrid(products)}
      ${renderLoadMoreSection({ hasMore, isLoadingMore, loadMoreError })}
    </div>
  `;
};
