import { BASE_PATH } from '@/constants';
import { initRouter } from '@/core/router';

const enableMocking = () =>
  import('@/mocks/browser.js').then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${BASE_PATH}/mockServiceWorker.js`,
      },
      onUnhandledRequest: 'bypass',
    })
  );

// TODO: 메인 정리!!
function main() {
  initRouter();
}

// Application Start
if (import.meta.env.MODE !== 'test') {
  enableMocking().then(main);
} else {
  main();
}
