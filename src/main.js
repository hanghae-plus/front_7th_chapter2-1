import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { Loading, ProductItem } from "./components/ProductList.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { ADD_CART_LIST, getLocalStorage, setLocalStorage } from "./utils/localstorage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 무한 스크롤 상태를 전역 변수로 관리합니다.
let globalObserver = null;
let isLoading = false;
let current = 1;

const push = (path) => {
  history.pushState(null, null, location.pathname + path);
  render();
};

const render = async () => {
  // render가 호출되면(필터 변경 등) 무한 스크롤 상태를 초기화합니다.
  current = 1;
  isLoading = false;
  if (globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }

  const basePath = import.meta.env.BASE_URL;
  const pathName = location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  const $root = document.querySelector("#root");

  const searchParams = new URLSearchParams(location.search);
  const category1 = searchParams.get("category1");
  const category2 = searchParams.get("category2");
  const search = searchParams.get("search");
  const limit = +searchParams.get("limit");
  const sort = searchParams.get("sort");

  if (relativePath === "/") {
    $root.innerHTML = HomePage({ loading: true });

    // render 시에는 항상 1페이지만 로드합니다.
    const data = await getProducts({
      category1,
      category2,
      search,
      limit,
      sort,
      current: 1, // 'current' 대신 '1'을 명시
    });
    const categories = await getCategories();
    $root.innerHTML = HomePage({ ...data, loading: false, categories });

    document.addEventListener("click", async (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        e.preventDefault();
        const productId = e.target.closest(".product-card").dataset.productId;
        push(`products/${productId}`);
        return;
      }

      const category1Button = e.target.closest(".category1-filter-btn");
      if (category1Button) {
        searchParams.set("category1", e.target.dataset.category1);
        push(`?${searchParams}`);
        return;
      }

      const category2Button = e.target.closest(".category2-filter-btn");
      if (category2Button) {
        searchParams.set("category2", e.target.dataset.category2);
        push(`?${searchParams}`);
        return;
      }
    });

    document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.stopPropagation(); // 프로덕트 카드 영역으로 이벤트 버블링 방지
        e.preventDefault();

        const productCard = e.target.closest(".product-card");

        if (productCard) {
          const storedData = getLocalStorage(ADD_CART_LIST);
          const addToCartTarget = await getProduct(productCard.dataset.productId);
          setLocalStorage(ADD_CART_LIST, [...storedData, addToCartTarget]);
          return;
        }
      });
    });

    const searchBar = document.querySelector("#search-input");
    searchBar.addEventListener("change", (e) => {
      searchBar.value = e.target.value;
    });

    const searchForm = document.querySelector("#search-form");
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      searchParams.set("search", searchBar.value);
      push(`?${searchParams}`);
    });

    const limitSelect = document.querySelector("#limit-select");
    if (searchParams.get("limit")) limitSelect.value = searchParams.get("limit");
    limitSelect.addEventListener("change", (e) => {
      searchParams.set("limit", String(e.target.value));
      push(`?${searchParams}`);
      return;
    });

    const sortSelect = document.querySelector("#sort-select");
    if (searchParams.get("sort")) sortSelect.value = searchParams.get("sort");
    sortSelect.addEventListener("change", (e) => {
      searchParams.set("sort", e.target.value);
      push(`?${searchParams}`);
      return;
    });

    // 무한 스크롤 Observer 설정
    const observerElement = document.querySelector("#observer");
    if (observerElement) {
      // observerElement가 있을 때만 실행
      globalObserver = new IntersectionObserver(
        async (entries) => {
          const firstEntry = entries[0]; // 옵저버에 등록된 요소가 1개 뿐이라 인덱스가 0인 요소를 지정해서 사용 가능
          // 뷰포트에 들어왔고, 로딩 중이 아닐 때만 실행
          if (firstEntry.isIntersecting && !isLoading) {
            isLoading = true; // 로딩 시작
            current += 1; // 다음 페이지
            observerElement.innerHTML = Loading; // 로딩 스피너 표시

            const newData = await getProducts({
              category1,
              category2,
              search,
              limit,
              sort,
              current, // 증가된 페이지로 요청
            });

            if (newData.products && newData.products.length > 0) {
              // 새 상품 HTML을 생성 (ProductItem 템플릿 사용)
              const newProductsHtml = newData.products.map(ProductItem).join("");

              // 'products-grid'에 새 HTML을 'beforeend'로 추가
              const productGrid = document.querySelector("#products-grid");
              if (productGrid) {
                productGrid.insertAdjacentHTML("beforeend", newProductsHtml);
              }

              observerElement.innerHTML = ""; // 로딩 스피너 제거
              isLoading = false; // 로딩 완료
            } else {
              // 더 이상 데이터가 없으면 Observer 중지
              if (globalObserver) globalObserver.disconnect();
              observerElement.innerHTML =
                "<div class='text-center py-4 text-sm text-gray-500'>모든 상품을 확인했습니다</div>";
            }
          }
        },
        {
          root: null, // 뷰포트 기준
          rootMargin: "0px 0px 50px 0px", // 화면 하단 50px 전에 미리 로드
          threshold: 0.1,
        },
      );
      globalObserver.observe(observerElement); // Observer 시작
    }
  } else if (relativePath.startsWith("/products")) {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ loading: false, product: data });
  } else {
    $root.innerHTML = NotFoundPage();
  }
};

function main() {
  window.addEventListener("popstate", () => render()); // popstate 이벤트는 main 함수에서 한 번만 등록
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
