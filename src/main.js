import { BASE_PATH } from '@/constants';
import { Router } from '@/core/router';
import DetailPage from '@/pages/detail/page';
import HomePage from '@/pages/home/page';
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

function main() {
  const routes = [
    { path: '/', component: HomePage, layout: true },
    { path: '/product/:id', component: DetailPage, layout: true },
    { path: '/template', component: TemplatePage, layout: false },
  ];
  const $root = document.getElementById('root');

  window.router = new Router($root, routes);
}

// Application Start
if (import.meta.env.MODE !== 'test') {
  enableMocking().then(main);
} else {
  main();
}
