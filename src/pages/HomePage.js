import { getCategories, getProducts } from "../api/productApi.js";
import { SearchForm } from "../components/SearchForm.js";
import { ProductList } from "../components/ProductList.js";
import { router } from "../router/index.js";
import { useState, useEffect, setCurrentComponent } from "../utils/hooks.js";

export const HomePage = () => {
  setCurrentComponent("HomePage");

  // ✅ 상태 관리
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesFetched, setCategoriesFetched] = useState(false);

  // 쿼리 파라미터
  const queryParams = router.getQueryParams();
  const filters = {
    page: parseInt(queryParams.page) || 1,
    limit: parseInt(queryParams.limit) || 20,
    search: queryParams.search || "",
    category1: queryParams.category1 || "",
    category2: queryParams.category2 || "",
    sort: queryParams.sort || "price_asc",
  };

  // ✅ useEffect: 필터 변경 시 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCategoriesLoading(!categoriesFetched);

      try {
        const promises = [getProducts(filters)];

        if (!categoriesFetched) {
          promises.push(getCategories());
        }

        const results = await Promise.all(promises);

        setProducts(results[0].products);
        setPagination(results[0].pagination);
        setLoading(false);

        if (!categoriesFetched) {
          setCategories(results[1]);
          setCategoriesLoading(false);
          setCategoriesFetched(true);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, [filters.page, filters.limit, filters.search, filters.category1, filters.category2, filters.sort]);

  // ✅ useEffect: 컴포넌트 마운트 시 실행 (빈 의존성 배열)
  useEffect(() => {
    console.log("HomePage mounted");

    // cleanup 함수 반환
    return () => {
      console.log("HomePage unmounted");
    };
  }, []);

  // ✅ useEffect: 특정 상태 변경 시 실행
  useEffect(() => {
    if (products.length > 0) {
      console.log("Products loaded:", products.length);
    }
  }, [products.length]);

  return /* html */ `
    ${SearchForm({
      categoriesLoading,
      categories,
      filters,
      pagination,
    })}
    ${ProductList({
      loading,
      products,
      pagination,
    })}
  `;
};
