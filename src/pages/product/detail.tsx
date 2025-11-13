import { Layout } from "../../shared/components/Layout";
import { ProductDetail } from "../../domains/product/components/ProductDetail";
import { useRouter } from "../routes";

export function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.pathParams;

  return (
    <Layout>
      <ProductDetail id={id} />
    </Layout>
  );
}
