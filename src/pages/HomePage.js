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
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 쿼리 파라미터
  const queryParams = router.getQueryParams();
  const filters = {
    current: parseInt(queryParams.current) || 1,
    limit: parseInt(queryParams.limit) || 20,
    search: queryParams.search || "",
    category1: queryParams.category1 || "",
    category2: queryParams.category2 || "",
    sort: queryParams.sort || "price_asc",
  };

  // ✅ useEffect: 필터 변경 시 상품 데이터 로드 (초기화)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts(filters);
        setProducts(data.products);
        setPagination(data.pagination);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.limit, filters.search, filters.category1, filters.category2, filters.sort]);

  // ✅ useEffect: 카테고리 로드 (최초 한 번만)
  useEffect(() => {
    const fetchCategories = async () => {
      if (categoriesFetched) return;

      setCategoriesLoading(true);

      try {
        const data = await getCategories();
        setCategories(data);
        setCategoriesLoading(false);
        setCategoriesFetched(true);
      } catch (error) {
        console.error(error);
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ✅ useEffect: Intersection Observer로 인피니티 스크롤 구현
  useEffect(() => {
    console.log("Effect!");
    // 로딩 중이거나 추가 로딩 중이면 observer 설정 안 함
    if (loading || isLoadingMore) return;

    // 더 이상 불러올 페이지가 없으면 observer 설정 안 함
    const hasMore = pagination.page < pagination.total;

    if (!hasMore) return;

    // DOM이 완전히 렌더링될 때까지 대기
    const setupObserver = () => {
      const sentinel = document.querySelector("#infinite-scroll-trigger");
      if (!sentinel) {
        console.log("Sentinel not found, retrying...");
        return null;
      }

      const observerCallback = async (entries) => {
        const [entry] = entries;

        // 센티널이 화면에 보이고, 추가 로딩 중이 아닐 때 다음 페이지 로드
        if (entry.isIntersecting && !isLoadingMore) {
          console.log("Loading more products...");
          setIsLoadingMore(true);

          try {
            const nextPage = pagination.current + 1;
            console.log("Next page:", nextPage);
            const data = await getProducts({
              ...filters,
              current: nextPage,
            });

            console.log("Loaded products:", data.products.length);

            // 기존 상품에 새 상품 추가
            setProducts((prevProducts) => [...prevProducts, ...data.products]);
            setPagination(data.pagination);
          } catch (error) {
            console.error("Failed to load more products:", error);
          } finally {
            setIsLoadingMore(false);
          }
        }
      };

      const observer = new IntersectionObserver(observerCallback, {
        root: null, // viewport를 기준으로
        rootMargin: "100px", // 100px 전에 미리 트리거
        threshold: 0.1, // 10%만 보여도 트리거
      });

      observer.observe(sentinel);
      console.log("Observer setup complete");

      return observer;
    };

    // setTimeout을 사용하여 DOM 렌더링 후 observer 설정
    const timeoutId = setTimeout(() => {
      const observer = setupObserver();

      // cleanup 함수에서 사용할 수 있도록 저장
      if (observer) {
        return () => {
          const sentinel = document.querySelector("#infinite-scroll-trigger");
          if (sentinel) {
            observer.unobserve(sentinel);
          }
          observer.disconnect();
          console.log("Observer cleaned up");
        };
      }
    }, 100);

    // cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [loading, isLoadingMore, pagination.page, pagination.total, products.length]);

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
    isLoadingMore,
  })}
`;
};
