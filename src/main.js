import { Homepage } from "./pages/Homepage";
import { getProducts, getProduct, getCategories } from "./api/productApi";
import { DetailPage } from "./pages/Detailpage";
import { Error } from "./components/error";
import { cartStore } from "./store/cartStore";
import { Header } from "./components/Header";
import { Toast } from "./components/Toast";
import { CartModalFn } from "./components/CartModalHandler";
import { detailHandler } from "./components/ProductDetail";
import { infiniteScrollManager } from "./utils/infiniteScroll";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) => {
    return worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    });
  });

export const push = (path) => {
  // BASE_URL이 포함된 경로인 경우, BASE_URL을 제거한 절대 경로로 변환
  const basePath = import.meta.env.BASE_URL;
  let finalPath = path;
  if (path.startsWith(basePath)) {
    // BASE_URL을 제거하고 절대 경로로 변환 (예: /front_7th_chapter2-1/product/123 -> /product/123)
    finalPath = path.replace(basePath, "/").replace(/\/$/, "") || "/";
  }
  // 홈 경로는 BASE_URL 없이 "/"로 처리
  if (finalPath === basePath || finalPath === `${basePath}/` || finalPath === "/") {
    finalPath = "/";
  }
  // 현재 URL과 같으면 히스토리에 추가하지 않음 (중복 방지)
  const currentPath = window.location.pathname;
  // currentPath에서 BASE_URL 제거하여 비교
  const currentPathWithoutBase = currentPath.startsWith(basePath)
    ? currentPath.replace(basePath, "/").replace(/\/$/, "") || "/"
    : currentPath.replace(/\/$/, "") || "/";
  if (currentPathWithoutBase === finalPath) {
    return;
  }
  // history.pushState에 BASE_URL 없이 절대 경로 전달
  // 히스토리 스택에 저장하기 위해 BASE_URL 없이 경로를 전달
  history.pushState(null, null, finalPath);
  // render()는 비동기이므로 즉시 호출
  render();
};

const render = async () => {
  const $root = document.querySelector("#root");
  const basePath = import.meta.env.BASE_URL;
  const pathName = window.location.pathname;
  // base path를 제거한 상대 경로 계산
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  if (relativePath === "/") {
    try {
      // 무한 스크롤 초기화
      infiniteScrollManager.destroy();
      infiniteScrollManager.init();

      // $root.innerHTML = Error();
      $root.innerHTML = Homepage({ loading: true });

      // URL 쿼리 파라미터 읽기
      const urlParams = new URLSearchParams(window.location.search);
      const category1 = urlParams.get("category1");
      const category2 = urlParams.get("category2");
      const search = urlParams.get("search");
      const sort = urlParams.get("sort");
      const limit = urlParams.get("limit");

      const params = {};
      if (category1) params.category1 = category1;
      if (category2) params.category2 = category2;
      if (search) params.search = search;
      if (sort) params.sort = sort;
      if (limit) params.limit = parseInt(limit);

      const data = await getProducts(params);
      const categories = await getCategories();
      console.log(data);
      $root.innerHTML = Homepage({
        loading: false,
        ...data,
        categories,
        selectedCategory1: category1,
        selectedCategory2: category2,
        filters: { ...(search && { search }), ...(sort && { sort }) },
      });

      // 무한 스크롤에 초기 데이터 설정
      infiniteScrollManager.setInitialData(
        data.products || [],
        data.pagination || {},
        categories,
        category1,
        category2,
      );
    } catch {
      $root.innerHTML = Error();
    }
  } else {
    // 상세 페이지로 이동 시 무한 스크롤 비활성화
    infiniteScrollManager.destroy();
    // relativePath에서 productId 추출 (예: /product/85067212996 -> 85067212996)
    const productId = relativePath.split("/").pop();
    $root.innerHTML = DetailPage({ loading: true });
    const data = await getProduct(productId);

    // 관련 상품 가져오기
    const relatedProductsData = await getProducts({
      category1: data.category1,
      category2: data.category2,
    });

    $root.innerHTML = DetailPage({
      loading: false,
      product: data,
      relatedProducts: relatedProductsData.products || [],
    });
    // 상세 페이지 장바구니 담기 버튼 이벤트 리스너 연결
    detailHandler.insertCart(data);
    detailHandler.increaseQuantity();
    detailHandler.decreaseQuantity();
    detailHandler.breadCrumb();
  }
};

//뒤로가기 이벤트 핸들러
window.addEventListener("popstate", () => {
  render();
});

// 상품 목록 갯수 클릭 이벤트 핸들러
document.body.addEventListener("change", async (e) => {
  console.log(e.target.value); // 갯수
  const limit = e.target.value;
  const $root = document.querySelector("#root");

  if (e.target.id !== "limit-select") return;

  // 현재 URL 파라미터 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const category1 = urlParams.get("category1");
  const category2 = urlParams.get("category2");
  const search = urlParams.get("search");
  const sort = urlParams.get("sort");

  // URL 업데이트
  const basePath = import.meta.env.BASE_URL;
  const newSearchParams = new URLSearchParams();
  if (category1) newSearchParams.set("category1", category1);
  if (category2) newSearchParams.set("category2", category2);
  if (search) newSearchParams.set("search", search);
  if (sort) newSearchParams.set("sort", sort);
  if (limit) newSearchParams.set("limit", limit);
  const newUrl = `${basePath}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
  history.pushState(null, null, newUrl);

  // limit 값으로 상품목록 재랜더링
  // 상품목록 조회 api의 params에 limit 값 변경
  const params = {
    limit: parseInt(limit),
  };
  if (category1) params.category1 = category1;
  if (category2) params.category2 = category2;
  if (search) params.search = search;
  if (sort) params.sort = sort;

  // 무한 스크롤 초기화
  infiniteScrollManager.destroy();
  infiniteScrollManager.init();

  // 로딩상태 표시
  $root.innerHTML = Homepage({ loading: true });

  // 카테고리 조회
  const categories = await getCategories();

  const data = await getProducts(params);
  console.log(data);
  $root.innerHTML = Homepage({
    loading: false,
    ...data,
    categories,
    selectedCategory1: category1,
    selectedCategory2: category2,
    filters: { ...(search && { search }), ...(sort && { sort }) },
  });

  // 무한 스크롤에 초기 데이터 설정
  infiniteScrollManager.setInitialData(data.products || [], data.pagination || {}, categories, category1, category2);
});

// 정렬 이벤트 핸들러
document.body.addEventListener("change", async (e) => {
  if (e.target.id !== "sort-select") return;
  const sort = e.target.value;
  const $root = document.querySelector("#root");

  // 현재 URL 파라미터 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const category1 = urlParams.get("category1");
  const category2 = urlParams.get("category2");
  const search = urlParams.get("search");
  const limit = urlParams.get("limit");

  // URL 업데이트
  const basePath = import.meta.env.BASE_URL;
  const newSearchParams = new URLSearchParams();
  if (category1) newSearchParams.set("category1", category1);
  if (category2) newSearchParams.set("category2", category2);
  if (search) newSearchParams.set("search", search);
  if (sort) newSearchParams.set("sort", sort);
  if (limit) newSearchParams.set("limit", limit);
  const newUrl = `${basePath}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
  history.pushState(null, null, newUrl);

  const params = {
    sort: sort,
  };
  if (category1) params.category1 = category1;
  if (category2) params.category2 = category2;
  if (search) params.search = search;
  if (limit) params.limit = parseInt(limit);

  // 무한 스크롤 초기화
  infiniteScrollManager.destroy();
  infiniteScrollManager.init();

  // 로딩상태 표시
  $root.innerHTML = Homepage({ loading: true });

  // 카테고리 조회
  const categories = await getCategories();

  const data = await getProducts(params);
  console.log(data);
  $root.innerHTML = Homepage({
    loading: false,
    ...data,
    categories,
    selectedCategory1: category1,
    selectedCategory2: category2,
    filters: search ? { search } : undefined,
  });

  // 무한 스크롤에 초기 데이터 설정
  infiniteScrollManager.setInitialData(data.products || [], data.pagination || {}, categories, category1, category2);
});

// 무한 스크롤 이벤트
document.body.addEventListener("scroll", async () => {
  // if( window.innerHeight + window.scrollY >= document.body.offsetHeight){
  //   const parmas = {
  //     page: 2,
  //   };
  //   const data = await getProducts(params);
  //   console.log(data);
  //   $root.innerHTML = Homepage({ loading: false, ...data, categories });
  // }
});

// 검색이벤트 엔터 핸들러
document.body.addEventListener("keydown", async (e) => {
  // 마우스가 검색창을 눌럿는지
  const $target = e.target;
  if ($target.id === "search-input" && e.keyCode === 13) {
    const searchVal = $target.value;
    const $root = document.querySelector("#root");

    // URL에서 현재 선택된 카테고리 읽어오기
    const urlParams = new URLSearchParams(window.location.search);
    const category1 = urlParams.get("category1");
    const category2 = urlParams.get("category2");

    const params = {
      search: searchVal,
    };
    if (category1) params.category1 = category1;
    if (category2) params.category2 = category2;

    // URL 업데이트 (카테고리 정보 유지)
    const basePath = import.meta.env.BASE_URL;
    const newSearchParams = new URLSearchParams();
    if (category1) newSearchParams.set("category1", category1);
    if (category2) newSearchParams.set("category2", category2);
    if (searchVal) newSearchParams.set("search", searchVal);
    const newUrl = `${basePath}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
    history.pushState(null, null, newUrl);

    // 무한 스크롤 초기화
    infiniteScrollManager.destroy();
    infiniteScrollManager.init();

    $root.innerHTML = Homepage({
      loading: true,
      filters: { search: searchVal },
      selectedCategory1: category1,
      selectedCategory2: category2,
    });
    const data = await getProducts(params);
    const categories = await getCategories();
    console.log(data);
    console.log(categories);
    $root.innerHTML = Homepage({
      loading: false,
      ...data,
      categories,
      filters: { search: searchVal },
      selectedCategory1: category1,
      selectedCategory2: category2,
    });

    // 무한 스크롤에 초기 데이터 설정
    infiniteScrollManager.setInitialData(data.products || [], data.pagination || {}, categories, category1, category2);
  }
});

// 검색 버튼 클릭 이벤트 핸들러
document.body.addEventListener("click", async (e) => {
  // if (e.target.id === "search-btn") {
  //   const $searchInput = document.querySelector("#search-input");
  //   if ($searchInput) {
  //     const searchVal = $searchInput.value;
  //     const $root = document.querySelector("#root");

  //     const params = {
  //       search: searchVal,
  //     };

  //     $root.innerHTML = Homepage({ loading: true, filters: { search: searchVal } });
  //     const data = await getProducts(params);
  //     const categories = await getCategories();
  //     console.log(data);
  //     console.log(categories);
  //     $root.innerHTML = Homepage({
  //       loading: false,
  //       ...data,
  //       categories,
  //       filters: { search: searchVal },
  //     });
  //   }
  // }

  // 검색 아이콘 클릭 이벤트 핸들러
  if (e.target.id === "search-icon" || e.target.closest("#search-icon")) {
    const $searchInput = document.querySelector("#search-input");
    if ($searchInput) {
      const searchVal = $searchInput.value;
      const $root = document.querySelector("#root");

      // URL에서 현재 선택된 카테고리 읽어오기
      const urlParams = new URLSearchParams(window.location.search);
      const category1 = urlParams.get("category1");
      const category2 = urlParams.get("category2");

      const params = {
        search: searchVal,
      };
      if (category1) params.category1 = category1;
      if (category2) params.category2 = category2;

      // URL 업데이트 (카테고리 정보 유지)
      const basePath = import.meta.env.BASE_URL;
      const newSearchParams = new URLSearchParams();
      if (category1) newSearchParams.set("category1", category1);
      if (category2) newSearchParams.set("category2", category2);
      if (searchVal) newSearchParams.set("search", searchVal);
      const newUrl = `${basePath}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
      history.pushState(null, null, newUrl);

      // 무한 스크롤 초기화
      infiniteScrollManager.destroy();
      infiniteScrollManager.init();

      $root.innerHTML = Homepage({
        loading: true,
        filters: { search: searchVal },
        selectedCategory1: category1,
        selectedCategory2: category2,
      });
      const data = await getProducts(params);
      const categories = await getCategories();
      console.log(data);
      console.log(categories);
      $root.innerHTML = Homepage({
        loading: false,
        ...data,
        categories,
        filters: { search: searchVal },
        selectedCategory1: category1,
        selectedCategory2: category2,
      });

      // 무한 스크롤에 초기 데이터 설정
      infiniteScrollManager.setInitialData(
        data.products || [],
        data.pagination || {},
        categories,
        category1,
        category2,
      );
    }
  }
});

// 카테고리 클릭 이벤트 핸들러
document.body.addEventListener("click", async (e) => {
  const $target = e.target;
  if ($target.classList.contains("category1-filter-btn")) {
    const category1 = $target.dataset.category1;
    console.log(category1);
    push(`${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}`);
  }

  if ($target.classList.contains("category2-filter-btn")) {
    const category1 = $target.dataset.category1;
    const category2 = $target.dataset.category2;

    console.log(category1, category2);
    push(
      `${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}&category2=${encodeURIComponent(category2)}`,
    );
  }
});

// 카테고리 브레드크럼 클릭 이벤트 핸들러
document.body.addEventListener("click", async (e) => {
  const $target = e.target;

  if ($target.hasAttribute("data-breadcrumb")) {
    console.log($target.dataset.category1);

    // 현재 URL에서 검색어 읽어오기
    const urlParams = new URLSearchParams(window.location.search);
    const currentSearch = urlParams.get("search");

    const basePath = import.meta.env.BASE_URL;
    const newSearchParams = new URLSearchParams();

    if ($target.dataset.breadcrumb === "reset") {
      // 검색어만 유지
      if (currentSearch) {
        newSearchParams.set("search", currentSearch);
      }
      push(`${basePath}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`);
    } else if ($target.dataset.breadcrumb === "category1") {
      const category1 = $target.dataset.category1;
      newSearchParams.set("category1", category1);
      if (currentSearch) {
        newSearchParams.set("search", currentSearch);
      }
      push(`${basePath}?${newSearchParams.toString()}`);
    } else if ($target.dataset.breadcrumb === "category2") {
      const category1 = $target.dataset.category1;
      const category2 = $target.dataset.category2;
      newSearchParams.set("category1", category1);
      newSearchParams.set("category2", category2);
      if (currentSearch) {
        newSearchParams.set("search", currentSearch);
      }
      push(`${basePath}?${newSearchParams.toString()}`);
    }
  }
});

// Header 업데이트 함수
const updateHeader = () => {
  const $header = document.querySelector("header");
  if ($header) {
    $header.outerHTML = Header();
  }
};

// 장바구니 상태 변경 구독
cartStore.subscribe(() => {
  updateHeader();
});

// 상품 목록으로 돌아가기 버튼 클릭 이벤트 핸들러
document.body.addEventListener("click", (e) => {
  if (e.target.closest(".go-to-product-list")) {
    push(`${import.meta.env.BASE_URL}`);
    render();
  }
});

// 상품 카드 클릭 이벤트 핸들러 (홈페이지 및 관련 상품)
document.body.addEventListener("click", (e) => {
  // 장바구니 버튼 클릭은 제외
  if (e.target.closest(".add-to-cart-btn")) return;

  const $productCard = e.target.closest(".product-card") || e.target.closest(".related-product-card");
  if ($productCard) {
    e.preventDefault();
    e.stopPropagation();
    const productId = $productCard.dataset.productId;
    const basePath = import.meta.env.BASE_URL;
    // BASE_URL을 포함한 전체 경로 생성
    const productPath = basePath.endsWith("/") ? `${basePath}product/${productId}` : `${basePath}/product/${productId}`;
    push(productPath);
  }
});

// 메인 리스트 장바구니 클릭 이벤트 핸들러 (이벤트 위임 방식, once 옵션 사용)
const handleAddToCart = async (e) => {
  // .add-to-cart-btn 클래스를 가진 버튼만 처리 (버튼 내부 요소 클릭도 처리)
  const $button = e.target.closest(".add-to-cart-btn");
  if (!$button) {
    return;
  }

  // 상세 페이지의 장바구니 버튼(id="add-to-cart-btn")은 제외
  if ($button.id === "add-to-cart-btn") {
    return;
  }

  e.stopPropagation();
  e.preventDefault();

  // 중복 클릭 방지
  if ($button.disabled || $button.dataset.processing === "true") {
    return;
  }
  $button.dataset.processing = "true";
  $button.disabled = true;

  console.log("✅ 메인 리스트 장바구니 버튼 클릭 처리 시작");

  const productId = $button.dataset.productId;

  try {
    // 상품 정보 가져오기
    const product = await getProduct(productId);

    // 장바구니에 추가
    console.log("📦 메인 리스트에서 addItem 호출");
    cartStore.addItem({
      productId: product.productId,
      title: product.title,
      image: product.image,
      lprice: product.lprice,
    });

    // state.items만 콘솔로 찍기
    console.log("장바구니 아이템들:", cartStore.getState().items);
    Toast({ result: "success" });
  } finally {
    // 처리 완료 후 버튼 활성화
    $button.dataset.processing = "false";
    $button.disabled = false;
  }
};

// 이벤트 위임 방식으로 등록
document.body.addEventListener("click", handleAddToCart);
console.log("✅ 장바구니 이벤트 핸들러 등록 완료");

const main = () => {
  render();
  // 장바구니 모달 컨트롤러 핸들러 초기화
  CartModalFn.init();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
