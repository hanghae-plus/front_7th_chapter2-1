import { Loading } from "@/components/Loading";
import { ProductList } from "@/components/ProductList";
import { SearchForm } from "@/components/SearchForm";
import { ProductState } from "@/store/products-list/productStore";

function ProductListPage(state: ProductState) {
  const { loading, products, params, pagination } = state;

  return /* html */ `
    ${SearchForm({ loading, params })}
    <div class="mb-6">
        ${loading ? `${Loading}` : `${ProductList({ products, total: pagination?.total ?? 0 })}`}
    </div>
`;
}

export { ProductListPage };
