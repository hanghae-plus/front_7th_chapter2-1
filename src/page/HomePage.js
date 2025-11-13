import SearchForm from "../component/SearchForm";
import ProductList from "../component/ProductList";
import { getProducts, getCategories } from "../api/productApi";
import { addToCart } from "../module/cartModule";
import State from "../store/stateStore";
import urlParamsModule from "../module/urlParamsModule";

const HomePage = async (render, { showToast }) => {
  const { setParams, getParams, getAllParams, deleteParams } = urlParamsModule();

  const isLoading = new State(true);
  const products = new State({ products: [], pagination: {} });

  const categories = new State({});
  const isCategoryLoading = new State(true);

  const page = new State(1);
  let io = null; // IntersectionObserver 인스턴스 저장

  function pageRender() {
    render(
      /*HTML*/ `
      <!-- 검색 및 필터 -->
     ${SearchForm({ isLoading: isCategoryLoading.get(), categories: categories.get(), limit: getParams("limit"), sort: getParams("sort"), search: getParams("search") || "", category1: getParams("category1"), category2: getParams("category2") })}
      <!-- 상품 목록 -->
     ${ProductList({ isLoading: isLoading.get(), products: products.get() })}
    `,
      pageRender,
    );

    // 렌더링 후 IntersectionObserver 재설정
    setupIntersectionObserver();
  }

  document.addEventListener("change", (e) => {
    // 상품수
    if (e.target.id === "limit-select") {
      const value = e.target.value;
      page.set(1, pageRender);
      setParams("limit", value);
      getProductsData();
    }

    // 정렬
    if (e.target.id === "sort-select") {
      const value = e.target.value;
      page.set(1, pageRender);
      setParams("sort", value);
      getProductsData();
    }
  });

  // 검색
  document.addEventListener("keydown", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      const value = e.target.value;
      page.set(1, pageRender);
      setParams("search", value);
      getProductsData();
    }
  });

  document.addEventListener("click", (e) => {
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
      page.set(1, pageRender);
      setParams("category1", value);
      getProductsData();
    }

    if (e.target.dataset.category2) {
      const value = e.target.dataset.category2;
      page.set(1, pageRender);
      setParams("category2", value);
      getProductsData();
    }

    // 브레드크럼 선택
    if (e.target.dataset.breadcrumb === "reset") {
      page.set(1, pageRender);
      deleteParams("category1");
      deleteParams("category2");
      getProductsData();
    }

    if (e.target.classList.contains("breadcrumb-btn1")) {
      const value = e.target.dataset.breadcrumb;
      page.set(1, pageRender);
      setParams("category1", value);
      deleteParams("category2");
      getProductsData();
    }

    // 장바구니 담기
    if (e.target.closest(".add-to-cart-btn")) {
      const btn = e.target.closest(".add-to-cart-btn");
      const productId = btn.dataset.productId;
      const product = products.get().products.find((product) => product.productId === productId);
      addToCart(product);
      pageRender();

      showToast({ message: "장바구니에 추가되었습니다", type: "success" });
    }
  });

  // 상품목록 가져오기
  const getProductsData = async () => {
    // error.set(null, pageRender);
    const productData = await getProducts({ ...getAllParams(), page: page.get() });
    page.get() === 1
      ? products.set(productData, pageRender)
      : products.set(
          { products: [...products.get().products, ...productData.products], pagination: productData.pagination },
          pageRender,
        );
    isLoading.set(false, pageRender);
  };

  // 카테고리목록 가져오기
  const getCategoriesData = async () => {
    isCategoryLoading.set(true, pageRender);
    const categoryData = await getCategories();
    categories.set(categoryData, pageRender);
    isCategoryLoading.set(false, pageRender);
  };

  await getProductsData();
  await getCategoriesData();

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
          isLoading.set(true, pageRender);

          await getProductsData();
        }
      };

      io = new IntersectionObserver(callback, { threshold: 0.7 });
      io.observe(targetElement);
    }
  }

  // 초기 observer 설정
  setupIntersectionObserver();
};

export default HomePage;
