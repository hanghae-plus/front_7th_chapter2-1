import { ProductList } from "../components/ProductList";
import { Search } from "../components/Serach";
import { PageLayout } from "./PageLayout";

export const HomePage = () => {
  return PageLayout({ children: `${Search()} ${ProductList({ loading: true })}` });
};
