//  items라는 배열 안에 장바구니 상품 추가
export const addCartItemToLocalStorage = (productId, product) => {
  if (!localStorage.getItem("shopping_cart")) {
    localStorage.setItem("shopping_cart", JSON.stringify({ selectedAll: false, items: [] }));
  }

  const productsInStorage = JSON.parse(localStorage.getItem("shopping_cart"));
  const findProduct = productsInStorage.items.find((item) => item.id === productId);

  if (findProduct) {
    productsInStorage.items.find((item) => item.id === productId).quantity += 1;
    localStorage.setItem("shopping_cart", JSON.stringify(productsInStorage));
  } else {
    const productInfo = {
      id: productId,
      image: product.image,
      price: Number(product.lprice),
      quantity: 1,
      selected: false,
      title: product.title,
    };
    // shopping_cart 객체의 items 배열에 추가
    productsInStorage.items.push(productInfo);
    localStorage.setItem("shopping_cart", JSON.stringify(productsInStorage));
  }
};

// 장바구니 상품 제거
export const removeCartItemFromLocalStorage = (productId) => {
  const productsInStorage = JSON.parse(localStorage.getItem("shopping_cart"));
  productsInStorage.items = productsInStorage.items.filter((item) => item.id !== productId);
  localStorage.setItem("shopping_cart", JSON.stringify(productsInStorage));
};

// 장바구니 조회
export const getCartItemsFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("shopping_cart"))?.items || [];
};

// 장바구니 카운트
export const getCartCountFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("shopping_cart"))?.items?.length || 0;
};

// 장바구니 체크박스 상태 업데이트
export const updateCartItemSelectedStatus = (productId, selected) => {
  const productsInStorage = JSON.parse(localStorage.getItem("shopping_cart"));
  const cartItem = productsInStorage.items.find((item) => item.id === productId);
  cartItem.selected = selected;

  // 모든 아이템이 선택되었으면 selectedAll도 true로, 하나라도 해제되면 false로
  const allSelected = productsInStorage.items.length > 0 && productsInStorage.items.every((item) => item.selected);
  productsInStorage.selectedAll = allSelected;

  localStorage.setItem("shopping_cart", JSON.stringify(productsInStorage));
};

// 전체선택 상태 업데이트
export const updateCartSelectAllStatus = (selectAll) => {
  const productsInStorage = JSON.parse(localStorage.getItem("shopping_cart"));
  productsInStorage.selectedAll = selectAll;
  // 모든 아이템의 selected 상태를 selectAll 값으로 변경
  productsInStorage.items.forEach((item) => {
    item.selected = selectAll;
  });
  localStorage.setItem("shopping_cart", JSON.stringify(productsInStorage));
};

// 전체선택 상태 조회
export const getCartSelectAllStatus = () => {
  return JSON.parse(localStorage.getItem("shopping_cart"))?.selectedAll || false;
};
