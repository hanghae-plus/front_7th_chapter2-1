import SearchForm from "../component/SearchForm";
import ProductList from "../component/ProductList";
import { getProducts, getCategories } from "../api/productApi";
import { addToCart } from "../module/cartModule";
import State from "../store/stateStore";

const HomePage = async (render, { showToast }) => {
  const isLoading = new State(true);
  const products = new State({ products: [], pagination: {} });

  const categories = new State({});
  const isCategoryLoading = new State(true);

  const category1 = new State("");
  const category2 = new State("");

  const limit = new State("20");
  const sort = new State("price_asc");
  const page = new State(1);

  const search = new State("");

  function pageRender() {
    render(/*HTML*/ `
      <!-- 검색 및 필터 -->
     ${SearchForm({ isLoading: isCategoryLoading.get(), limit: limit.get(), sort: sort.get(), search: search.get(), categories: categories.get(), category1: category1.get(), category2: category2.get() })}
      <!-- 상품 목록 -->
     ${ProductList({ isLoading: isLoading.get(), products: products.get() })}
     <div height="100px" id="end-of-list"/>
    `);
  }

  pageRender();

  // 상품목록 가져오기
  const getProductsData = async () => {
    isLoading.set(true, pageRender);
    const productData = await getProducts({
      limit: limit.get(),
      sort: sort.get(),
      search: search.get(),
      category1: category1.get(),
      category2: category2.get(),
      page: page.get(),
    });
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

  document.addEventListener("change", (e) => {
    // 상품수
    if (e.target.id === "limit-select") {
      const value = e.target.value;
      page.set(1, pageRender);
      limit.set(value, pageRender);
      getProductsData();
    }

    // 정렬
    if (e.target.id === "sort-select") {
      const value = e.target.value;
      page.set(1, pageRender);
      sort.set(value, pageRender);
      getProductsData();
    }
  });

  // 검색
  addEventListener("keydown", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      const value = e.target.value;
      page.set(1, pageRender);
      search.set(value, pageRender);
      getProductsData();
    }
  });

  addEventListener("click", (e) => {
    if (e.target.closest(".product-card")) {
      const productId = e.target.closest(".product-card").dataset.productId;
      window.location.href = `${import.meta.env.BASE_URL}product/${productId}`;
    }
    // 카테고리 선택
    if (e.target.dataset.category1) {
      const value = e.target.dataset.category1;
      category1.set(value, pageRender);
      page.set(1, pageRender);
      getProductsData();
    }

    if (e.target.dataset.category2) {
      const value = e.target.dataset.category2;
      category2.set(value, pageRender);
      page.set(1, pageRender);
      getProductsData();
    }

    // 브레드크럼 선택
    if (e.target.dataset) {
      switch (e.target.dataset.breadcrumb) {
        case "reset":
          category1.set("", pageRender);
          category2.set("", pageRender);
          page.set(1, pageRender);
          getProductsData();
          break;
        case "category1":
          category2.set("", pageRender);
          page.set(1, pageRender);
          getProductsData();
          break;
      }
    }

    // 장바구니 담기
    if (e.target.closest(".add-to-cart-btn")) {
      const productId = e.target.dataset.productId;
      const product = products.get().products.find((product) => product.productId === productId);
      addToCart(product);
      showToast({ message: "장바구니에 추가되었습니다", type: "success" }, pageRender);
    }
  });

  // 무한스크롤
  const callback = (entries, io) => {
    entries.forEach(async (entry) => {
      // 화면 안에 요소가 들어왔는지 체크
      if (entry.isIntersecting) {
        // 기존 관찰하던 요소는 더 이상 관찰하지 않음
        io.unobserve(entry.target);

        if (products.get().pagination.hasNext) {
          page.set(page.get() + 1, pageRender);
          await getProductsData();
          io.observe(document.querySelectorAll(".product-card")?.[products.get().products.length - 5]);
        }
      }
    });
  };

  const io = new IntersectionObserver(callback, { threshold: 0.7 });
  io.observe(document.querySelectorAll(".product-card")?.[products.get().products.length - 5]);
};

export default HomePage;
