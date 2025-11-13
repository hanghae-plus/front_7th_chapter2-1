import { ProductList } from "./components/ProductList.js";
import layout from "./page/PageLayout.js";
import { getProducts, getCategories } from "./api/productApi.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

async function main() {
  // 1. 먼저 로딩 상태 표시
  const loadingHTML = layout({
    children: ProductList,
  });
  document.querySelector("#root").innerHTML = loadingHTML;

  // 2. 데이터 로드
  try {
    // 상품과 카테고리를 동시에 로드
    const [productsData, categoriesData] = await Promise.all([getProducts({ limit: 20, page: 1 }), getCategories()]);

    // API 응답 데이터를 ProductList가 기대하는 형식으로 변환
    const products = productsData.products.map((item) => ({
      id: item.productId,
      name: item.title,
      price: parseInt(item.lprice),
      imageUrl: item.image,
      mallName: item.mallName,
    }));

    // 3. 데이터 로드 완료 후 상품 목록 렌더링
    const productsHTML = layout({
      children: () =>
        ProductList({
          isLoading: false,
          products: products,
          totalCount: productsData.pagination.total,
          categories: categoriesData,
        }),
    });
    document.querySelector("#root").innerHTML = productsHTML;
  } catch (error) {
    console.error("상품 목록을 불러오는데 실패했습니다:", error);
    // 에러 처리 로직 추가 가능
  }

  // ============================================
  // 아래는 컴포넌트 데모 코드 (개발 참고용)
  // ============================================
  /*
  const 상품목록_레이아웃_카테고리_1Depth = CategoryFilter1Depth({
    category1: "생활/건강",
    subCategories: ["생활용품", "주방용품", "문구/사무용품"],
  });

  const 상품목록_레이아웃_카테고리_2Depth = CategoryFilter2Depth({
    category1: "생활/건강",
    category2: "주방용품",
    subCategories: ["생활용품", "주방용품", "문구/사무용품"],
  });

  const 토스트 = ToastDemo();

  const 장바구니_비어있음 = CartModal({
    items: [],
    selectedCount: 0,
    totalPrice: 0,
    hasSelection: false,
  });

  const 장바구니_선택없음 = CartModal({
    items: [
      {
        product: {
          id: "85067212996",
          name: "PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장",
          price: 220,
          imageUrl: "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg",
          quantity: 2,
        },
        isSelected: false,
      },
      {
        product: {
          id: "86940857379",
          name: "샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이",
          price: 230,
          imageUrl: "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg",
          quantity: 1,
        },
        isSelected: false,
      },
    ],
    selectedCount: 0,
    totalPrice: 670,
    hasSelection: false,
  });

  const 장바구니_선택있음 = CartModal({
    items: [
      {
        product: {
          id: "85067212996",
          name: "PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장",
          price: 220,
          imageUrl: "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg",
          quantity: 2,
        },
        isSelected: true,
      },
      {
        product: {
          id: "86940857379",
          name: "샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이",
          price: 230,
          imageUrl: "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg",
          quantity: 1,
        },
        isSelected: false,
      },
    ],
    selectedCount: 1,
    totalPrice: 670,
    hasSelection: true,
  });

  const 상세페이지_로딩 = layout({
    children: ProductDetailLoading,
  });

  const 상세페이지_로딩완료 = layout({
    children: ProductDetailLoaded({
      product: {
        id: "85067212996",
        name: "PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장",
        price: 220,
        imageUrl: "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg",
        mallName: "",
        rating: 4,
        reviewCount: 749,
        stock: 107,
        category1: "생활/건강",
        category2: "생활용품",
        cartCount: 1,
      },
      relatedProducts: [
        {
          id: "86940857379",
          name: "샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이",
          price: 230,
          imageUrl: "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg",
        },
        {
          id: "82094468339",
          name: "실리카겔 50g 습기제거제 제품 /산업 신발 의류 방습제",
          price: 280,
          imageUrl: "https://shopping-phinf.pstatic.net/main_8209446/82094468339.4.jpg",
        },
      ],
    }),
  });

  const _404_ = NotFound();

  document.body.innerHTML = `
    ${상품목록_레이아웃_로딩}
    <br />
    ${상품목록_레이아웃_로딩완료}
    <br />
    ${상품목록_레이아웃_카테고리_1Depth}
    <br />
    ${상품목록_레이아웃_카테고리_2Depth}
    <br />
    ${토스트}
    <br />
    ${장바구니_비어있음}
    <br />
    ${장바구니_선택없음}
    <br />
    ${장바구니_선택있음}
    <br />
    ${상세페이지_로딩}
    <br />
    ${상세페이지_로딩완료}
    <br />
    ${_404_}
  `;
  */
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
