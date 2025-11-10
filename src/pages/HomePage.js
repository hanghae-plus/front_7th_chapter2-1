import { ProductList } from "../components/products/ProductList";
import { Search } from "../components/search/Serach";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ loading, products }) => {
  return PageLayout({ children: `${Search({ loading })} ${ProductList({ loading, products })}` });
};
