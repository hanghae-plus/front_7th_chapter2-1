import { getProduct, getProducts } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

async function render() {
  const $root = document.querySelector("#root");

  if (location.pathname === "/") {
    $root.innerHTML = HomePage({ loading: true });
    const data = await getProducts();
    console.log(data);
    $root.innerHTML = HomePage({ ...data, loading: false });

    document.body.addEventListener("click", (e) => {
      if (e.target.closest(".product-card")) {
        console.log("click 호출");
        const productId = e.target.closest(".product-card").dataset.productId;
        history.pushState(null, null, `/products/${productId}`);
        render();
      }
    });
  } else {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);
    console.log(data);
    $root.innerHTML = DetailPage({ loading: false, product: data });
  }
}

// {
//   "title": "PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장",
//   "link": "https://smartstore.naver.com/main/products/7522712674",
//   "image": "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg",
//   "lprice": "220",
//   "hprice": "",
//   "mallName": "기브N기브",
//   "productId": "85067212996",
//   "productType": "2",
//   "brand": "",
//   "maker": "",
//   "category1": "생활/건강",
//   "category2": "생활용품",
//   "category3": "생활잡화",
//   "category4": "쇼핑백",
//   "description": "PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장에 대한 상세 설명입니다.  브랜드의 우수한 품질을 자랑하는 상품으로, 고객 만족도가 높은 제품입니다.",
//   "rating": 4,
//   "reviewCount": 870,
//   "stock": 95,
//   "images": [
//       "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1.jpg",
//       "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1_2.jpg",
//       "https://shopping-phinf.pstatic.net/main_8506721/85067212996.1_3.jpg"
//   ]
// }

window.addEventListener("popstate", () => {
  render();
});

async function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
