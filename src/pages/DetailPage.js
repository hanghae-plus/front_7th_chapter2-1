import { getProduct } from "../api/productApi.js";
import { ProductDetail } from "../components/ProductDetail.js";
import { useState, useEffect, setCurrentComponent } from "../utils/hooks.js";

export const DetailPage = (params) => {
  setCurrentComponent("DetailPage");

  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);

      try {
        const data = await getProduct(productId);
        console.log(data);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return ProductDetail({ loading, product });
};
