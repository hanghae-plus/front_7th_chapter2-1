import { getProduct, getProducts } from '@/api/productApi';
import { Detail, Home, NotFound, Template } from '@/pages';

const enableMocking = () =>
  import('./mocks/browser.js').then(({ worker }) =>
    worker.start({
      onUnhandledRequest: 'bypass',
    })
  );

const render = async () => {
  const $root = document.getElementById('root');

  // 홈페이지
  if (location.pathname === '/') {
    $root.innerHTML = Home({ loading: true });
    const data = await getProducts();
    $root.innerHTML = Home({ ...data, loading: false });
  }
  // 상품 상세 페이지
  else if (location.pathname.startsWith('/products/')) {
    $root.innerHTML = Detail({ loading: true });
    const productId = location.pathname.split('/').pop();

    try {
      const product = await getProduct(productId);

      if (product.error) throw new Error(product.error);
      $root.innerHTML = Detail({ product, loading: false });
    } catch {
      $root.innerHTML = NotFound();
    }
  }
  // 템플릿 페이지
  else if (location.pathname === '/template') {
    $root.innerHTML = Template();
  }
  // 404 페이지
  else {
    $root.innerHTML = NotFound();
  }
};

function main() {
  const router = {
    push: (path) => {
      history.pushState({}, '', path);
      render();
    },
  };

  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.product-card')) {
      const productId = e.target.closest('.product-card').dataset.productId;
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
