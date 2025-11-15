import SearchForm from "../component/SearchForm";
import ProductList from "../component/ProductList";
import { getProducts, getCategories } from "../api/productApi";
import { addToCart } from "../module/cartModule";
import State from "../store/stateStore";
import urlParamsModule from "../module/urlParamsModule";
import Error from "../component/Error";

const HomePage = async (render, { showToast }) => {
  const { setParams, getParams, getAllParams, deleteParams } = urlParamsModule();

  const isLoading = new State(true);
  const products = new State({ products: [], pagination: {} });

  const categories = new State({});
  const isCategoryLoading = new State(true);

  const page = new State(1);
  let io = null; // IntersectionObserver 인스턴스 저장
  let isInitialized = false; // 초기화 여부 체크

  async function pageRender() {
    // 첫 렌더링 시에만 데이터 로드
    if (!isInitialized) {
      isInitialized = true;
      await Promise.all([getProductsData(), getCategoriesData()]);
    }
    render(/*HTML*/ `
      <!-- 검색 및 필터 -->
     ${SearchForm({ isLoading: isCategoryLoading.get(), categories: categories.get(), limit: getParams("limit") || "20", sort: getParams("sort") || "price_asc", search: getParams("search") || "", category1: getParams("category1") || "", category2: getParams("category2") || "" })}
      <!-- 상품 목록 -->
     ${ProductList({ isLoading: isLoading.get(), products: products.get() })}
    `);

    // 렌더링 후 IntersectionObserver 재설정
    setupIntersectionObserver();
  }

  document.addEventListener("change", async (e) => {
    // 상품수
    if (e.target.id === "limit-select") {
      const value = e.target.value;
      page.set(1);
      setParams("limit", value);
      await getProductsData();
    }

    // 정렬
    if (e.target.id === "sort-select") {
      const value = e.target.value;
      page.set(1);
      setParams("sort", value);
      await getProductsData();
    }
  });

  // 검색
  document.addEventListener("keydown", async (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      const value = e.target.value;
      page.set(1);
      value ? setParams("search", value) : deleteParams("search");
      await getProductsData();
    }
  });

  document.addEventListener("click", async (e) => {
    // 장바구니 버튼 클릭이 아닌 경우에만 상세페이지로 이동
    if (e.target.closest(".product-card") && !e.target.closest(".add-to-cart-btn")) {
      const productId = e.target.closest(".product-card").dataset.productId;
      const newUrl = `${import.meta.env.BASE_URL}product/${productId}`;
      history.pushState(null, "", newUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }

    // 카테고리 선택
    if (e.target.dataset.category1) {
      const value = e.target.dataset.category1;
      page.set(1);
      deleteParams("category2");
      setParams("category1", value);
      await getProductsData();
    }

    if (e.target.dataset.category2) {
      const value = e.target.dataset.category2;
      page.set(1);
      setParams("category2", value);
      await getProductsData();
    }

    // 브레드크럼 선택
    if (e.target.dataset.breadcrumb === "reset") {
      page.set(1);
      deleteParams("category1");
      deleteParams("category2");
      await getProductsData();
    }

    if (e.target.classList.contains("breadcrumb-btn1")) {
      const category1 = e.target.dataset.breadcrumb;
      page.set(1);
      deleteParams("category2");
      setParams("category1", category1);
      await getProductsData();
    }

    // 장바구니 담기
    if (e.target.closest(".add-to-cart-btn")) {
      const btn = e.target.closest(".add-to-cart-btn");
      const productId = btn.dataset.productId;
      const product = products.get().products.find((product) => product.productId === productId);
      addToCart(product);
      await pageRender();
      // DOM 렌더링이 완전히 완료될 때까지 대기 (CI 환경 안정성)
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      showToast({ message: "장바구니에 추가되었습니다", type: "success" });
    }

    if (e.target.id === "retry-btn") {
      await getProductsData();
    }
  });

  // 상품목록 가져오기
  const getProductsData = async () => {
    isLoading.set(true, pageRender);
    const productData = await getProducts({ ...getAllParams(), page: page.get() }).catch((e) => e.response);
    if (!productData) {
      products.set({ products: [], pagination: {} });
      isLoading.set(false);
      render(Error());
      return;
    }

    if (page.get() === 1) {
      products.set(productData);
    } else {
      products.set({
        products: [...products.get().products, ...productData.products],
        pagination: productData.pagination,
      });
    }
    isLoading.set(false, pageRender);
  };

  // 카테고리목록 가져오기
  const getCategoriesData = async () => {
    isCategoryLoading.set(true);
    const categoryData = await getCategories();
    categories.set(categoryData);
    isCategoryLoading.set(false);
  };

  // 무한스크롤 설정
  function setupIntersectionObserver() {
    // 기존 observer가 있으면 연결 해제
    if (io) {
      io.disconnect();
    }

    const productCards = document.querySelectorAll(".product-card");
    const targetIndex = products.get().products.length - 1;
    const targetElement = productCards[targetIndex];

    // 관찰할 요소가 있고, 다음 페이지가 있을 때만 observer 설정
    if (targetElement && products.get().pagination?.hasNext) {
      const callback = async (entries) => {
        const entry = entries[0]; // 첫 번째 entry만 처리

        // 화면 안에 요소가 들어왔고, 로딩 중이 아닐 때만 실행
        if (entry.isIntersecting && !isLoading.get() && products.get().pagination.hasNext) {
          page.set(page.get() + 1);

          await getProductsData();
        }
      };

      io = new IntersectionObserver(callback, { threshold: 0.7 });
      io.observe(targetElement);
    }
  }

  // 초기 observer 설정
  setupIntersectionObserver();

  return { pageRender };
};

export default HomePage;
