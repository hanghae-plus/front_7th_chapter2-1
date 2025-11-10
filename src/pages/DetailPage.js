import { ProductDetail } from "../components/ProductDetail";
import { PageLayout } from "./PageLayout";

export const DetailPage = ({ loading, product }) => {
  return PageLayout({ children: ProductDetail({ loading, product }) });
};
