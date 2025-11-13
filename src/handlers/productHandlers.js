/**
 * 상품 카드 클릭 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onNavigateToDetail - 상세 페이지로 이동하는 함수
 */
export function handleProductCardClick(event, onNavigateToDetail) {
  if (event.target.closest(".add-to-cart-btn")) {
    event.stopPropagation();
    return;
  }

  const card = event.currentTarget;
  const productId = card.dataset.productId;

  if (!productId) {
    return;
  }

  if (onNavigateToDetail) {
    onNavigateToDetail(productId);
  }
}
