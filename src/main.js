import { getCategories, getProduct, getProducts } from '@/api/productApi';
import { DetailPage } from '@/pages/DetailPage';
import { HomePage } from '@/pages/HomePage';

const enableMocking = () =>
  import('@/mocks/browser.js').then(({ worker }) =>
    worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

const push = (path) => {
  history.pushState(null, null, path);
  render();
};

const render = async () => {
  const $root = document.querySelector('#root');
  const url = new URL(window.location);
  const limit = parseInt(url.searchParams.get('limit')) || 20;
  const page = parseInt(url.searchParams.get('current')) || 1;
  const search = url.searchParams.get('search') || '';
  const category1 = url.searchParams.get('category1') || '';
  const category2 = url.searchParams.get('category2') || '';
  const sort = url.searchParams.get('sort') || 'price_asc';

  if (window.location.pathname === `${import.meta.env.BASE_URL}`) {
    $root.innerHTML = HomePage({
      loading: true,
      pagination: { limit, page },
      filters: { sort, search, category1, category2 },
    });

    const productsData = await getProducts({
      limit,
      page,
      search,
      category1,
      category2,
      sort,
    });

    const categoriesData = await getCategories();
    $root.innerHTML = HomePage({
      loading: false,
      ...productsData,
      categories: categoriesData,
    });
  } else {
    const productId = window.location.pathname.split('/products/')[1];
    $root.innerHTML = DetailPage({ loading: true });
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ loading: false, product: data });
  }
};

document.body.addEventListener('click', (e) => {
  const $target = e.target;

  if ($target.closest('.product-card')) {
    const productId = $target.closest('.product-card').dataset.productId;
    push(`${import.meta.env.BASE_URL}products/${productId}`);
    render();
  }
});

window.addEventListener('popstate', render);

document.body.addEventListener('change', (e) => {
  const $target = e.target;

  if ($target.id === 'limit-select') {
    const newLimit = parseInt($target.value);
    const url = new URL(window.location);
    url.searchParams.set('limit', newLimit);
    url.searchParams.set('current', '1');
    history.pushState(null, null, url);
    render();
  }
});

document.body.addEventListener('change', (e) => {
  const $target = e.target;

  if ($target.id === 'sort-select') {
    const newSort = $target.value;
    const url = new URL(window.location);
    url.searchParams.set('sort', newSort);
    url.searchParams.set('current', '1');
    history.pushState(null, null, url);
    render();
  }
});

const main = () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== 'test') {
  enableMocking().then(main);
} else {
  main();
}
