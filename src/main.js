import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { CartModal } from "./components/CartModal.js";
import { Loading, ProductItem } from "./components/ProductList.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { getQueryParams } from "./utils/getQueryParams.js";
import { ADD_CART_LIST, getLocalStorage, setLocalStorage } from "./utils/localstorage.js";
import { showToast } from "./utils/showToast.js";

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
  history.pushState(null, null, path);
  render();
};

const closeCartModal = () => {
  const cartModal = document.querySelector(".cart-modal");
  if (cartModal) {
    cartModal.remove();
    document.removeEventListener("keydown", handleCartModalEscape);
  }
};

const handleCartModalEscape = (e) => {
  if (e.key === "Escape") {
    closeCartModal();
  }
};

// 장바구니 개수만 업데이트하는 함수
const updateCartCount = () => {
  const cartData = getLocalStorage(ADD_CART_LIST);
  const count = cartData.length;
  const cartIconBtn = document.querySelector("#cart-icon-btn");

  if (!cartIconBtn) return;

  // 기존 span 찾기
  let cartCountElement = document.querySelector("#cart-count");

  if (count === 0) {
    // 개수가 0이면 span 제거
    if (cartCountElement) {
      cartCountElement.remove();
    }
  } else {
    // 개수가 1 이상이면
    if (cartCountElement) {
      // span이 있으면 숫자만 업데이트
      cartCountElement.textContent = count;
    } else {
      // span이 없으면 새로 생성 (처음 추가할 때)
      const newSpan = document.createElement("span");
      newSpan.id = "cart-count";
      newSpan.className =
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
      newSpan.textContent = count;
      cartIconBtn.appendChild(newSpan);
    }
  }
};

// 무한 스크롤 초기화 함수
const resetInfiniteScroll = () => {
  current = 1;
  isLoading = false;
  if (globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }
};

// 무한 스크롤 설정 함수
const setupInfiniteScroll = () => {
  const { category1, category2, search, limit, sort } = getQueryParams();
  const observerElement = document.querySelector("#observer");

  if (!observerElement) return;

  globalObserver = new IntersectionObserver(
    async (entries) => {
      const firstEntry = entries[0];

      if (firstEntry.isIntersecting && !isLoading) {
        isLoading = true;
        current += 1;
        observerElement.innerHTML = Loading;

        const newData = await getProducts({
          category1,
          category2,
          search,
          limit,
          sort,
          current,
        });

        if (newData.products && newData.products.length > 0) {
          const newProductsHtml = newData.products.map(ProductItem).join("");
          const productGrid = document.querySelector("#products-grid");

          if (productGrid) {
            productGrid.insertAdjacentHTML("beforeend", newProductsHtml);
          }

          observerElement.innerHTML = "";
          isLoading = false;
        } else {
          if (globalObserver) globalObserver.disconnect();
          observerElement.innerHTML =
            "<div class='text-center py-4 text-sm text-gray-500'>모든 상품을 확인했습니다</div>";
        }
      }
    },
    {
      root: null,
      rootMargin: "0px 0px 50px 0px",
      threshold: 0.1,
    },
  );

  globalObserver.observe(observerElement);
};

// 홈페이지 이벤트 리스너 등록 함수
const setupHomePageEvents = () => {
  const { searchParams } = getQueryParams();

  // 검색 폼
  const searchBar = document.querySelector("#search-input");
  const searchForm = document.querySelector("#search-form");

  if (searchBar) {
    searchBar.addEventListener("change", (e) => {
      searchBar.value = e.target.value;
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      searchParams.set("search", searchBar.value);
      push(`?${searchParams}`);
    });
  }

  // 개수 선택
  const limitSelect = document.querySelector("#limit-select");
  if (limitSelect) {
    const limit = searchParams.get("limit");
    if (limit) limitSelect.value = limit;

    limitSelect.addEventListener("change", (e) => {
      searchParams.set("limit", String(e.target.value));
      push(`?${searchParams}`);
    });
  }

  // 정렬 선택
  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect) {
    const sort = searchParams.get("sort");
    if (sort) sortSelect.value = sort;

    sortSelect.addEventListener("change", (e) => {
      searchParams.set("sort", e.target.value);
      push(`?${searchParams}`);
    });
  }
};

// 홈페이지 렌더링 함수
const renderHomePage = async () => {
  const $root = document.querySelector("#root");
  const { category1, category2, search, limit, sort } = getQueryParams();

  // 무한 스크롤 상태 초기화
  resetInfiniteScroll();

  // 로딩 상태 표시
  $root.innerHTML = HomePage({ loading: true });

  // 데이터 페칭
  const data = await getProducts({
    category1,
    category2,
    search,
    limit,
    sort,
    current: 1,
  });
  const categories = await getCategories();

  // 최종 렌더링
  $root.innerHTML = HomePage({ ...data, loading: false, categories, pageTitle: "쇼핑몰" });

  // 이벤트 리스너 등록
  setupHomePageEvents();

  // 무한 스크롤 설정
  setupInfiniteScroll();
};

// 상세 페이지 렌더링 함수
const renderDetailPage = async () => {
  const $root = document.querySelector("#root");

  // 로딩 상태 표시
  $root.innerHTML = DetailPage({ loading: true });

  // 데이터 페칭
  const productId = location.pathname.split("/").pop();
  const data = await getProduct(productId);
  const responsiveData = await getProducts({
    category1: data.category1,
    category2: data.category2,
  });

  // 최종 렌더링
  $root.innerHTML = DetailPage({
    pageTitle: "상품 상세",
    loading: false,
    product: data,
    responsiveList: responsiveData.products,
  });
};

// 404 페이지 렌더링 함수
const renderNotFoundPage = () => {
  const $root = document.querySelector("#root");
  $root.innerHTML = NotFoundPage();
};

// 라우팅 담당 render 함수
const render = async () => {
  const basePath = import.meta.env.BASE_URL;
  const pathName = location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  if (relativePath === "/") {
    await renderHomePage();
  } else if (relativePath.startsWith("/products")) {
    await renderDetailPage();
  } else {
    renderNotFoundPage();
  }
};

function main() {
  // popstate 이벤트 등록
  window.addEventListener("popstate", () => render());

  // 이벤트 위임 방식으로 클릭 이벤트 처리
  // render 함수 내에서 클릭 이벤트를 추가했던 기존 방식에서 main 함수에서 클릭 이벤트를 추가하는 방식으로 수정
  // render 함수 내에서 추가 시 render 함수 호출 할 때마다 root에 클릭 이벤트가 추가되어 중복되는 문제 발생 =>
  // 제품 카드 1번 눌렀는데 여러 번 등록된 클릭 이벤트 때문에 /products/82094468339/products/82094468339 이런 식으로 되어버리는 문제 발생

  // 이벤트 위임 방식으로 해결
  // => 각 엘리먼트에 이벤트를 추가하게 되면 render ($root에 출력될 요소 갈아 끼우기) 함수 실행 시 해당 엘리먼트가 제거됨 => 클릭 이벤트 날아감
  // => root 요소가 바뀔 때 클릭 이벤트 핸들러가 추가되지 않음 ! (main 함수는 최초 렌더링 시에만 실행되기 때문)
  // => 따라서 이벤트 위임 방식으로 $root에 클릭 이벤트 추가 ($root는 없어지지 않으니깐 !)
  const $root = document.querySelector("#root");

  $root.addEventListener("click", async (e) => {
    // 장바구니 추가 버튼
    const addCartButton = e.target.closest(".add-to-cart-btn");
    if (addCartButton) {
      e.stopPropagation();
      e.preventDefault();

      const productCard = e.target.closest(".product-card");
      if (productCard) {
        const storedData = getLocalStorage(ADD_CART_LIST);
        const addToCartTarget = await getProduct(productCard.dataset.productId);
        setLocalStorage(ADD_CART_LIST, [...storedData, addToCartTarget]);

        // 장바구니 개수만 업데이트
        updateCartCount();
      }

      showToast("success");
      return;
    }

    // 상품 카드 클릭
    const productCard = e.target.closest(".product-card");
    if (productCard) {
      e.preventDefault();
      const productId = productCard.dataset.productId;
      push(`products/${productId}`);
      return;
    }

    // 카테고리1 필터 버튼
    const category1Button = e.target.closest(".category1-filter-btn");
    if (category1Button) {
      const { searchParams } = getQueryParams();
      searchParams.set("category1", e.target.dataset.category1);
      push(`?${searchParams}`);
      return;
    }

    // 카테고리2 필터 버튼
    const category2Button = e.target.closest(".category2-filter-btn");
    if (category2Button) {
      const { searchParams } = getQueryParams();
      searchParams.set("category2", e.target.dataset.category2);
      push(`?${searchParams}`);
      return;
    }

    const category1Breadcrumb = e.target.closest("#category1-breadcrumb");
    if (category1Breadcrumb) {
      const { searchParams } = getQueryParams();
      searchParams.delete("category2");
      push(`?${searchParams}`);
    }

    const goToProductList = e.target.closest(".go-to-product-list");
    if (goToProductList) {
      e.preventDefault();
      push("/front_7th_chapter2-1/");
      return;
    }

    const detailAddToCartBtn = e.target.closest("#add-to-cart-btn");
    if (detailAddToCartBtn) {
      const quantityInput = document.querySelector("#quantity-input");
      if (quantityInput) {
        const storedData = getLocalStorage(ADD_CART_LIST);
        const productId = location.pathname.split("/").pop();
        const addToCartTarget = await getProduct(productId);
        setLocalStorage(ADD_CART_LIST, [...storedData, addToCartTarget]);

        updateCartCount();
      }
    }

    const relatedProductCard = e.target.closest(".related-product-card");
    if (relatedProductCard) {
      const productId = relatedProductCard.dataset.productId;
      // TODO : /products/:id 절대 방식으로 수정
      // /front_7th_chapter2-1/ 이걸 로컬 환경에서 환경 변수 선언해서 쓰거나, 로컬에선 url에 제거하기
      push(`${productId}`);
      return;
    }

    // 장바구니 아이콘 클릭
    const cartIconBtn = e.target.closest("#cart-icon-btn");
    if (cartIconBtn) {
      const cartModal = document.querySelector(".cart-modal");
      if (!cartModal) {
        $root.innerHTML += CartModal();
        document.addEventListener("keydown", (e) => handleCartModalEscape(e));
      }
      return;
    }

    // 장바구니 모달 바깥 영역 클릭
    const cartModalOverlay = e.target.closest(".cart-modal-overlay");
    if (cartModalOverlay) {
      closeCartModal();
      return;
    }

    // 장바구니 close 버튼 클릭
    const carModalCloseBtn = e.target.closest("#cart-modal-close-btn");
    if (carModalCloseBtn) {
      closeCartModal();
      return;
    }
  });

  // 초기 렌더링
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
