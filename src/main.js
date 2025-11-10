import { getCategories, getProduct, getProducts } from '@/api/productApi';
import { BASE_PATH } from '@/constants';
import DetailPage from '@/pages/detail/page';
import HomePage from '@/pages/home/page';
import NotFound from '@/pages/not-found';
import TemplatePage from '@/pages/template';

const enableMocking = () =>
  import('@/mocks/browser.js').then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${BASE_PATH}/mockServiceWorker.js`,
      },
      onUnhandledRequest: 'bypass',
    })
  );

const render = async () => {
  const $root = document.getElementById('root');
  // 홈페이지
  if (location.pathname === `${BASE_PATH}/`) {
    $root.innerHTML = HomePage({ loading: true });
    const data = await getProducts();
    const categories = await getCategories();
    $root.innerHTML = HomePage({ ...data, categories, loading: false });
  }
  // 상품 상세 페이지
  else if (location.pathname.startsWith(`${BASE_PATH}/products/`)) {
    $root.innerHTML = DetailPage({ loading: true });
    const productId = location.pathname.split('/').pop();

    try {
      const product = await getProduct(productId);

      if (/** @type {any} */ (product)?.error) throw new Error(/** @type {any} */ (product).error);
      $root.innerHTML = DetailPage({ product, loading: false });
    } catch {
      $root.innerHTML = NotFound();
    }
  }
  // 템플릿 페이지
  else if (location.pathname === `${BASE_PATH}/template`) {
    $root.innerHTML = TemplatePage();
  }
  // 404 페이지
  else {
    $root.innerHTML = NotFound();
  }
};

function main() {
  const router = {
    push: (path) => {
      history.pushState({}, '', `${BASE_PATH}${path}`);
      render();
    },
  };

  document.body.addEventListener('click', (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const card = /** @type {HTMLElement|null} */ (target.closest('.product-card'));

    if (card) {
      const productId = card.dataset.productId;
      router.push(`/products/${productId}`);
    }
  });

  render();
  window.addEventListener('popstate', render);
}

// 애플리케이션 시작
if (import.meta.env.MODE !== 'test') {
  enableMocking().then(main);
} else {
  main();
}
