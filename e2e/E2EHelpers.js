export class E2EHelpers {
  constructor(page) {
    this.page = page;
  }

  // 페이지 로딩 대기
  async waitForPageLoad() {
    await this.page.waitForSelector('[data-testid="products-grid"], #products-grid', { timeout: 10000 });
    await this.page.waitForFunction(() => {
      const text = document.body.textContent;
      return text.includes("총") && text.includes("개");
    });
    // 실제 상품 카드가 렌더링될 때까지 대기
    await this.page.waitForSelector(".product-card", { timeout: 10000 });
    // 로딩이 완료될 때까지 대기
    await this.page.waitForFunction(
      () => {
        const loadingText = document.body.textContent;
        return !loadingText.includes("카테고리 로딩 중");
      },
      { timeout: 10000 },
    );
  }

  // 상품을 장바구니에 추가
  async addProductToCart(productName) {
    await this.page.click(
      `text=${productName} >> xpath=ancestor::*[contains(@class, 'product-card')] >> .add-to-cart-btn`,
    );
    await this.page.waitForSelector("text=장바구니에 추가되었습니다", { timeout: 5000 });
  }

  // 장바구니 모달 열기
  async openCartModal() {
    await this.page.click("#cart-icon-btn");
    await this.page.waitForSelector(".cart-modal-overlay", { timeout: 5000 });
  }
}
