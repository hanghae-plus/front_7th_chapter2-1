import { ProductList } from "../components/products/ProductList";
import { Search } from "../components/search/Serach";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ loading, products, pagination }) => {
  return PageLayout({ children: `${Search({ loading })} ${ProductList({ loading, products, pagination })}` });
};
