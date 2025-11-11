import { Breadcrumb, ProductDetail } from "../components";
import { Layout } from "../layout/Layout";

export const ProductDetailPage = () =>
  Layout({
    children: `
      ${Breadcrumb()}
      ${ProductDetail()}
    `,
  });
