import { getProduct, getProducts } from "../api/productApi.js";
import { ProductDetail } from "../components/ProductDetail.js";
import { useState, useEffect, setCurrentComponent } from "../utils/hooks.js";

export const DetailPage = (params) => {
  setCurrentComponent("DetailPage");

  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

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

  useEffect(() => {
    if (!product) return;

    const fetchRelatedProducts = async () => {
      try {
        const data = await getProducts({
          limit: 10,
          category1: product.category1,
          category2: product.category2,
          sort: "price_asc",
        });

        const filtered = data.products.filter((p) => p.productId !== product.productId).slice(0, 2);

        setRelatedProducts(filtered);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  return ProductDetail({ loading, product, relatedProducts });
};
