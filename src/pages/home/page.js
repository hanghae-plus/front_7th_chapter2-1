import { getCategories, getProducts } from '@/api/productApi';
import Component from '@/core/component';
import { navigate } from '@/core/router';

import ProductList from '@/pages/home/components/ProductList';
import SearchForm from '@/pages/home/components/SearchForm';

// TODO: 컴포넌트 정리!!
export default class HomePage extends Component {
  setup() {
    this.state = {
      loading: true,
      products: [],
      categories: [],
      pagination: {},
    };
    this.fetchHomePageData();
  }

  async fetchHomePageData() {
    const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()]);
    const normalizedCategories = Object.entries(categoriesData || {}).map(([name, children]) => ({
      name,
      subCategories: Object.keys(children || {}),
    }));

    this.setState({
      loading: false,
      products: productsData.products,
      pagination: productsData.pagination,
      categories: normalizedCategories,
    });
  }

  template() {
    return /* HTML */ `
      <main class="max-w-md mx-auto px-4 py-4">
        <div data-slot="search-form"></div>
        <div data-slot="product-list"></div>
      </main>
    `;
  }

  mounted() {
    const $searchForm = this.$target.querySelector('[data-slot="search-form"]');
    const $productList = this.$target.querySelector('[data-slot="product-list"]');

    new SearchForm($searchForm, {
      loading: this.state.loading,
      categories: this.state.categories,
    });

    new ProductList($productList, {
      loading: this.state.loading,
      products: this.state.products,
    });
  }

  setEvent() {
    this.addEvent('click', '.product-card', (e) => {
      const productCard = e.target.closest('.product-card');
      if (productCard?.dataset.productId) {
        navigate(`/products/${productCard.dataset.productId}`);
      }
    });
  }
}
