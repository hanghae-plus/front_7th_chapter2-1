import ProductCard from "./ProductCard";
import createComponent from "../core/component/create-component";
import FilterToolbox from "./FilterToolbox";

const ProductList = createComponent({
  id: "product-list",
  props: {
    products: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: true,
      hasPrev: false,
    },
    filters: {
      search: "",
      category1: "",
      category2: "",
      sort: "price_asc",
    },
    categories: [],
    handleSetSort: () => {},
    handleSetLimit: () => {},
    handleSetSearch: () => {},
    handleSetSelectedCategory1: () => {},
    handleSetSelectedCategory2: () => {},
  },
  templateFn: (props) => {
    const handleSetSort = (value) => {
      props.handleSetSort(value);
    };
    const handleSetLimit = (value) => {
      props.handleSetLimit(value);
    };
    const handleSetSearch = (value) => {
      props.handleSetSearch(value);
    };
    const handleSetSelectedCategory1 = (value) => {
      props.handleSetSelectedCategory1(value);
    };
    const handleSetSelectedCategory2 = (value) => {
      props.handleSetSelectedCategory2(value);
    };

    return /* HTML */ `
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        ${FilterToolbox.mount({
          filters: props.filters,
          pagination: props.pagination,
          categories: props.categories,
          limit: props.pagination?.limit,
          sort: props.filters?.sort,
          search: props.filters?.search,
          selectedCategory1: props.filters?.category1,
          selectedCategory2: props.filters?.category2,
          handleSetSort,
          handleSetLimit,
          handleSetSearch,
          handleSetSelectedCategory1,
          handleSetSelectedCategory2,
        }).outerHTML}
        <!-- 상품 목록 -->
        <div class="mb-6">
          <!-- 상품 개수 정보 -->
          <div class="mb-4 text-sm text-gray-600">
            총 <span class="font-medium text-gray-900">${props.pagination?.total}개</span>의 상품
          </div>
          <!-- 상품 그리드 -->
          <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            ${(props.products || [])
              .map(
                (product) =>
                  ProductCard.mount({
                    productId: product.productId,
                    image: product.image,
                    title: product.title,
                    brand: product.brand,
                    lprice: product.lprice,
                  }).outerHTML,
              )
              .join("\n")}
          </div>

          <div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>
        </div>
      </main>
    `;
  },
});

export default ProductList;
