import { ProductList } from "../components/ProductList";
import { Search } from "../components/Serach";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ loading, products }) => {
  return PageLayout({ children: `${Search({ loading })} ${ProductList({ loading, products })}` });
};
