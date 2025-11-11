import { BASE_PATH } from '@/constants';
import DetailPage from '@/pages/detail/page';
import HomePage from '@/pages/home/page';
import Layout from '@/pages/layout';
import NotFound from '@/pages/not-found';
import TemplatePage from '@/pages/template';

// TODO: 라우터 정리!!
let $root;

const routes = [
  { path: '/', component: HomePage, layout: Layout },
  { path: '/products/:id', component: DetailPage, layout: Layout },
  { path: '/template', component: TemplatePage, layout: null },
];

const findMatchedRoute = (pathname) => {
  const path = pathname.replace(new RegExp(`^${BASE_PATH}`), '') || '/';
  for (const route of routes) {
    const routePathParts = route.path.split('/').filter(Boolean);
    const currentPathParts = path.split('/').filter(Boolean);
    if (routePathParts.length !== currentPathParts.length) continue;
    const params = {};
    const isMatch = routePathParts.every((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = currentPathParts[i];
        return true;
      }
      return part === currentPathParts[i];
    });
    if (isMatch) return { route, params };
  }
  return null;
};

const render = () => {
  if (!$root) return;

  const match = findMatchedRoute(location.pathname);

  $root.innerHTML = '';
  const $placeholder = document.createElement('div');
  $root.appendChild($placeholder);

  if (!match) {
    new Layout($placeholder, { children: NotFound });
    return;
  }

  const { route, params } = match;
  const { component: PageComponent, layout: LayoutComponent } = route;

  LayoutComponent
    ? new LayoutComponent($placeholder, { children: PageComponent, props: { params } })
    : new PageComponent($placeholder, { params });
};

export const navigate = (path) => {
  history.pushState({}, '', `${BASE_PATH}${path}`);
  render();
};

export const initRouter = () => {
  $root = document.getElementById('root');
  if (!$root) {
    console.error('Cannot find #root element to initialize router.');
    return;
  }
  window.addEventListener('popstate', render);
  render();
};
