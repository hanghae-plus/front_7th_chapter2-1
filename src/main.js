import { ProductList } from "./components/ProductList.js";
import layout from "./page/PageLayout.js";
import { CategoryFilter1Depth, CategoryFilter2Depth } from "./components/CategoryFilter.js";
import { ToastDemo } from "./components/Toast.js";
import { CartModal } from "./components/Cart.js";
import NotFound from "./components/NotFound.js";
import { ProductDetailLoading, ProductDetailLoaded } from "./components/ProductDetail.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

function main() {
  const 상품목록_레이아웃_로딩 = layout({
    children: ProductList,
  });

  const 상품목록_레이아웃_로딩완료 = layout({
    children: () =>
      ProductList({
        isLoading: false,
        products: [
          {
            id: "85067212996",
            name: "PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장",
            price: 220,
            imageUrl: "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg",
            mallName: "",
          },
          {
            id: "86940857379",
            name: "샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이",
            price: 230,
            imageUrl: "https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg",
            mallName: "이지웨이건축자재",
          },
        ],
        totalCount: 340,
      }),
  });

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
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
