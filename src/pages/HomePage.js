import { ProductList } from "../components/products/ProductList";
import { Search } from "../components/search/Serach";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ loading, products, pagination, categories, limit }) => {
  return PageLayout({
    children: `${Search({ loading, categories, limit })} ${ProductList({ loading, products, pagination })}`,
  });
};
