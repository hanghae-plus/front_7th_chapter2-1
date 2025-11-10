import ProductList from '@/pages/home/components/ProductList';
import SearchForm from '@/pages/home/components/SearchForm';
import Layout from '@/pages/layout';

/**
 * 홈페이지 컴포넌트
 *
 * @param {{
 *  filters?: Filters,
 *  pagination?: Pagination,
 *  products?: Array<BaseProduct>,
 *  categories?: CategoryResponse,
 *  loading: boolean,
 * }} props
 * @returns {string}
 */
const HomePage = ({ filters, pagination, products, categories, loading }) => {
  console.log(filters, pagination, products, categories, loading);
  return Layout({
    children: /* HTML */ ` ${SearchForm({ loading })} ${ProductList({ products, loading })} `,
  });
};

export default HomePage;
