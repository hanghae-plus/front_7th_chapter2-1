이 과제는 tailwind기반으로 된 ui와, 기능 요구사항을 가지고 vanilla js로 SPA를 구현하는 것이다.
성능적 최적화라든가, 버추얼 돔까지는 고려하지 않았다.
실제로 SPA를 단순하게 구현해보며 디자인 패턴을 적용해보고 컴포넌트의 '생명주기'를 구현하는 것을 목표했다.

1. 라우터 만들기
먼저 간단하게 라우터를 구현하기로 했다. 왜냐하면, GitHub Pages에 배포를 하면 라우터나 경로 문제가 생길 것이므로 이걸 먼저 해결해놓고 개발에 집중하는 게 편하기 때문이다. 처음에는 라우터에 대해 별다른 깊은 고민을 하지 않고 만들었다. routes 배열과 renderPage함수를 우선 만들어 렌더링이 되는 걸 확인하고 추가로 Router 함수를 붙였다. 즉시실행 함수를 이용한 싱글턴 패턴이다. 이 함수를 추가할 당시에는 아무 생각 없이 노션의 예제를 베이스로 만들었기 때문에 싱글턴까지 생각을 못 했다가 나중에 깨달았다. 

```js
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";

const routes = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/detail",
    component: DetailPage,
  },
];

export const Router = (() => {
  let currentPath = window.location.pathname;

  return () => ({
    getPath: () => currentPath,
    push: (path) => {
      if (currentPath === path) return;
      currentPath = path;
      window.history.pushState({}, "", path);
      renderPage();
    },
  });
})();

export const renderPage = (routerId = "router-view") => {
  const path = window.location.pathname;
  const route = routes.find((r) => r.path === path);
  const routerRoot = document.getElementById(routerId);

  if (!routerRoot) return;

  if (route) {
    routerRoot.innerHTML = route.component();
  } else {
    routerRoot.innerHTML = "<h1>not found😂</h1>";
  }
};

let initialized = false;

export const initRouter = () => {
  if (initialized) return;
  initialized = true;

  const router = Router();

  renderPage();

  // 뒤로가기
  window.addEventListener("popstate", () => renderPage());

  document.addEventListener("click", (e) => {
    const { target } = e;
    if (target.dataset.routerLink) {
      router.push(target.dataset.routerLink);
    }
  });
};
```
평소엔 이벤트 위임 방식을 생각해보지 않았는데, 이 방식이 유리한 면이 있다. React에선 실제로 이벤트 위임 방식으로 이벤트 리스너를 추가한다고 한다.

```js
 <div id="router-view"></div>
```
템플릿 안에서 라우터 영역을 만들어준다. 처음에는 이것도 레이아웃 컴포넌트 안에서 엘리먼트를 찾아서 innerHTML안에 템플릿을 넣으려 했는다. 그러나... DOM에 아직 존재하지 않는 엘리먼트를 찾을 수 없다. 😳 순수하게 템플릿 문자열만 리턴하는 함수로 구성되어 있기 때문이다. 그래서 `queueMicrotask(() => {})`를 사용해서 한 틱 미룬 뒤에 엘리먼트를 찾은 후에 페이지를 렌더링 하는 시도를 했었다. 실행 타이밍이 정확히 언제인지 확신이 없어서 쓰지 않았다. 대신 `initRouter`로 main 함수 안에서 한번 초기화 하도록 했다. 

2. 배포 
워크플로우를 추가하여 main에 푸쉬 하면 빌드하여 github-pages에 배포되도록 했다. 이렇게만 올리면.. 안 된다. 기본 경로(/front_7th_chapter2-1/)가 자동으로 붙기 때문에, Vite의 base 옵션을 해당 경로로 설정해주어야 한다.

```js
// vite.config.js
base: env.VITE_BASE_PATH || "/",
```
사실 환경변수를 굳이 추가하지 않아도 분기 처리는 가능하지만, 그냥 명시적으로 설정해두었다.

이렇게 하면 에셋의 경로는 잘 잡아주지만 라우터의 베이스도 다시 잡아야 한다. 라우터에서 BASE_PATH가 존재하면 잘 잘라내도록 설정을 해주어야 한다. 

그렇게 하고 배포를 했을 때 잘 나올 줄 알았는데 아무것도 화면에 나오지 않았다. msw 경고는 무시하고 라우터 부터 보려고 했었는데, msw 설정에 실패하면 뒤의 함수가 실행되지 않게 되어있었다. 
```js
// main.js
import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.VITE_BASE_PATH}mockServiceWorker.js`,
      },
    }),
```
이와 같이 수정한다. 기본적인 라우터가 작동되는 것을 확인할 수 있다.

그럼 이제 새로고침이 안 될 것을 예상할 수 있다. SPA라 페이지를 못 찾기 때문이다. github-pages는 이럴 경우 404.html로 폴백 처리 하는데 그냥 간단하게 해결했다. 
package.json에서 빌드 후 index.html을 404.html으로 복사해준다. 
```json
 "build": "vite build && cp dist/index.html dist/404.html",
```
여기까지 하면 배포 문제가 해결된다.


3. 컴포넌트
가장 고민을 많이 한 부분이다.

우선 컴포넌트를 함수와 클래스 중에 고민 했는데 요즘엔 함수형 프로그래밍을 선호하기도 하고 팀원의 함수형을 지향한다는 의견을 따라서 아무 생각 없이 함수형 컴포넌트로 시작을 했다. (함수로 작성했을 뿐 본격적으로 함수형 프로그래밍을 사용한 것은 아니다.)
단순하게 문자열을 리턴하는 함수형 컴포넌트를 사용하면 컴포넌트 내에서 비동기 작업을 할 수 없고, 단순한 프레젠테이션 컴포넌트에 가깝다. 따라서 컴포넌트 안에 render 와 같은 함수가 필요했고 그러려면 부모를 기반으로 렌더링을 해야 한다. 
컴포넌트 안에서 컨테이너를 만들고 아이디를 고정하여 리렌더링하는 방식도 시도해 보았지만 이 방식도 렌더링 시점을 정확히 파악하기 어려운 것 같아서 폐기했다. 유니크한 ID라든가..React의 Path와 같은 개념을 쓸 수 있으면 좋을 것 같으나 이 단계에서는 최대한 간단한 구조로 먼저 구현하는 게 나을 거라 판단했다.

이러한 렌더 함수가 있는 컴포넌트는 데이터를 fetch하는 페이지 단위에서만 우선 적용하면 될 것 같아 일단 페이지 안에서 작업을 했다. 그리고 라우터 초기화 시점에서 받은 라우터 컨테이너의 id를, renderPage 함수에서 에서 항상 전달하면 된다.

```
// router.js
 ...
    route.component({
      root: routerRoot,
    });
...
```

```js
...
// 페이지 내
  render();

  const response = await fetch("/api/products");
  const data = await response.json();
  products = data.products;
  pagination = data.pagination;
  isLoading = false;

...

  render();
```

이렇게 하면 상태 관리도 귀찮고 이벤트 바인딩을 하면 항상 초기화 된다. 어느 정도 공통화를 하고 싶었다.
하지만 생명 주기를 어떻게 관리해야 할지는 고민이 되었다. 우선 넘어가서 상세 페이지 작업을 마저 했다. 그 뒤 AI의 도움을 (많이) 받았다. 
```js
export const createPage = (root) => {
  let state = {};
  const template = '...'

  const render = () => {
     root.innerHTML = template;
  }
}
```
전부 객체로 리턴시키는 식으로 컴포넌트를 작성할 수도 있었는데, 모양이 vue의 options api와 비슷해졌다. 나는 별로 좋아하지 않는 방식이고 훅을 사용하고 싶었기에 몇 번 질의를 하여 컴포넌트의 초안은 이렇게 잡았다. (이후에도 여러 번 수정을 했다.)



```js
export const createPage = (root, setup) => {
  let state = {};
  let view = () => "";
  const binders = [];
  let cleanups = [];

  const getState = () => ({ ...state });
  const setState = (patch) => {
    state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
    render();
  };

  const template = (fn) => {
    view = fn;
  };
  const afterRender = (fn) => {
    console.log("afterRender");
    binders.push(fn);
  };

  const render = () => {
    // 이전 바인딩 제거
    cleanups.forEach((fn) => fn && fn());
    cleanups = [];

    // 그리기
    root.innerHTML = view(state);

    // 새 바인딩
    binders.forEach((fn) => {
      const c = fn({ root, getState, setState });
      if (typeof c === "function") cleanups.push(c);
    });
  };

  setup({ getState, setState, template, afterRender });
  render();

  return {
    unmount() {
      console.log("unmount");
      cleanups.forEach((fn) => fn && fn());
      cleanups = [];
      root.replaceChildren();
    },
  };
};
```
페이지 위주로 컴포넌트를 작업하고 단순히 뷰만 가지고 있는 컴포넌트는 순수 템플릿 함수를 유지하기로 했다.

4. 이벤트 버스
라우터 영역에서 페이지 단위로 컴포넌트를 만들어놨는데 헤더도 동적으로 변경되는 내용이 있었다. 대충 처음엔 라우터 안에서 헤더를 업데이트했다가 그러면 컴포넌트를 나눈 의미가 없는 것 같았다. 그래서 라우터의 개선이 필요했다. 단순히 라우터가 컴포넌트를 렌더링하고 끝나는 게 아니라, 컴포넌트 내부에서 라우트의 변화를 감지 할 수 있어야 한다. 어떤 방식으로 할 수 있을까 하다가, 처음엔 커스텀 이벤트를 만들어서 핑퐁하려 했다. 그러면서 장바구니도 다 이벤트로 처리했다. 이렇게 목록, 상세, 카트 추가를 기능 구현만 완료했다.
```js
  window.dispatchEvent(new CustomEvent("route:changed", { detail: { path } }));
 window.dispatchEvent(new CustomEvent("cart:add", { detail: { productId, quantity: state.quantity } }));
```

그런데 이러면 유지보수도 힘들 거 같고 쓸 때마다 이벤트 리스너를 추가해야 할 수도 있고 어디에 이벤트 리스너 추가했는지 까먹을 수 있어서 메모리 누수도 발생할 수 있을 것 같다.

노션의 지식 뭉치를 읽어다가 옵저버 패턴이 있었고, 옵저버 패턴을 GPT에게 물어보다가 `이벤트 버스`를 사용하라는 방식을 들었다. 그래서 구현해달라고 했다. 😄    
https://github.com/milmilkim/front_7th_chapter2-1/commit/b6b2bfa492284708e03ca954f4d21c13bc4e07ff
싱글턴 클래스는 아니지만 `모듈 캐시에 의한 싱글턴`이다. 
라우터가 즉시 실행 함수로 구현된 싱글턴이라면,이벤트 버스는 new EventBus()를 한 번만 생성해서 export하기 때문에 모든 모듈이 동일한 인스턴스를 공유하는 형태의 싱글턴이 된다.

그러다보니 무한 루프에 걸렸다. 스테이트가 변경될 때마다 렌더를 했고 렌더 안에서 이벤트 등록을 했기 때문이다.
상태 변경 → 렌더 → 렌더 안에서 이벤트 on → emit → 다시 상태 변경 → 다시 렌더…  
이 패턴이 반복되면서 구독이 렌더 횟수만큼 중첩되고, 결국 무한 루프가 발생했다.

해서 render()함수와 별도로 onMount, onUpdated, (onUnmount)를 추가했다. 어쩌다보니 Vue를 따라하고 있었다. 그리고 최대한 간단하게 가려 했지만 라이프 사이클에 대해 고민하느라 머리가 아파지기 시작했다.


5. 옵저버 패턴 상태 관리
https://github.com/milmilkim/front_7th_chapter2-1/blob/7b2607733a732734fb2d9f9ea9532821e5acfef8/src/stores/cartStore.js
장바구니의 경우 옵저버 패턴으로 상태를 관리할 수 있도록 했다. 노션 내용을 참고하여 구현은 AI에게 맡겼다. 
cartStore 뿐 아니라 다른 Store도 추가될 수 있도록 처음엔 베이스 클래스를 추상화 하려 했지만, 함수형으로 만드려는 처음의 생각이 있었기에 함수로 바꾸었다. 최근 나는 zustand를 썼기 때문에 그런 모양으로 만들었다.

6. 리팩토링
https://github.com/milmilkim/front_7th_chapter2-1/commit/f4ee764ca73ee638d746b37b317307ea30bea8b2
불필요하다고 생각되는 부분을 정리하고 컴포넌트 형식을 바꾸고 useAsync 훅을 만드는 시도를 했었다.
그런데 useAsync를 쓰려면 또 구독을 해야 하고 더 복잡한 거 같아서 이것은 일단 없애고, 기능 구현을 마저 하기로 했다.

7. 무한 스크롤
`intersection observer` API를 통해 구현한다.

```js
 // 무한 스크롤 옵저버 생성
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log("무한 스크롤 옵저버 트리거");
          const { isLoading, data } = getState();
          const pagination = data?.pagination || {};

          // 로딩 중이거나 더 이상 데이터가 없으면 요청하지 않음
          if (isLoading) return;
          if (!pagination.hasNext) return;

          // 다음 페이지 로드
          const { filter } = getState();
          setState({ filter: { ...filter, page: filter.page + 1 } });
          fetchProducts();
        }
      });
    });
```
잘 안 된다! isLoading이 true일 때 그대로 끝나서 아무 일도 일어나지 않았던 것이다.

```js
  // 매 렌더링마다 - sentinel 다시 관찰
  onUpdated(() => {
    if (!observer) return;

    const sentinel = document.querySelector("#sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }
  });
```
onUpdated마다 다시 확인하도록 했다.

8. 모달
모달의 경우 이벤트 버스를 사용한다. 구독중인 장바구니 모달이 이벤트를 받으면 상태를 변경한다. 모달 자체는 컴포넌트이며 스토어의 값을 사용한다. 스토어는 로컬스토리지에서 값을 초기화하고 업데이트 한다. 

9. 쿼리스트링
앞에서 라우터 이벤트를 다 만들어 놓았기에 이벤트를 구독하고 거기에 맞춰 검색 필터의 값을 넣어준다. 초반에 만든 라우터에서 계속 분기를 추가하여 만들었는데, 지저분해졌다. 그래서 나중에 정리하기로 했다.

10. 리팩토링
여기까지 하면 CI에 초록불이 들어온다. E2E 테스트를 통과한다. 하지만 우선 구현을 한다가 목표였기에 제대로 검수하지 않았기 때문에 이제 테스트가 깨지지 않는 상태를 유지하며 리팩토링 진행한다. 이 과정에서 e2e 테스트의 소중함을 느낄 수 있다. 테스트 코드가 존재하기 때문에 맘 놓고 이것저것 테스트 해볼 수 있다. 하지만 이미 작성된 E2E 테스트만으로는 잡히지 않는 문제가 있을 수 있기 때문에 눈으로도 봐가며 진행했다.

```js
   // 장바구니 Store 구독
    unsubscribe = cartStore.subscribe((cartState) => {
      setState({
        items: cartState.items || [],
        selectedItems: new Set(Array.from(cartState.items.filter((item) => item.selected)).map((item) => item.id)),
      });
```
우선 이미 개발된 부분의 스토어 구독 부분을 살펴본다. cartStore를 구독하여 상태가 변경되면 setState를 호출하여 state의 값을 바꾸고 그래서 컴포넌트가 업데이트된다. 좀 별로인 것 같았다.

```js
 const useStore = (store) => {
      const unsubscribe = store.subscribe(() => {
        // 스토어 변경 시 리렌더 트리거
        render();
      });

      mountCleanups.push(unsubscribe);
    };
```
컴포넌트 셋업 함수에 useStore를 추가하여 스토어 변경시 컴포넌트가 업데이트하도록 했다.

```js
   const items = cartStore.getState().items;
```

그리고 컴포넌트를 마운트 하는 방식이 통일되어야 했다. 기존엔 컴포넌트 팩토리 함수를 호출하면 바로 render()함수를 실행했는데 이러면 언제 렌더링을 하겠다는 건지 알기 어렵다. 또, 부모 컴포넌트 안에 자식 컴포넌트가 있을 경우 부모 컴포넌트의 DOM이 렌더링 된 시점에서 루트를 찾아야 자식 컴포넌트를 렌더링 할 수 있으므로 이 컴포넌트의 뷰가 한번 마운트 된 시점을 알 필요가 있다. 그래서 onMounted를 추가했다. onMount는 삭제하고 onBeforeMount를 추가했다. render함수는 리턴했다.

```js
export const createComponent = (setup) => {
  return ({ root, props = {}, options }) => {
    let state = {};
    let view = () => "";

    /**
     * lifecycle callbacks
     */
    const beforeMountCallbacks = [];
    const mountedCallbacks = [];
    const updatedCallbacks = [];
    const unmountCallbacks = [];

    let isMounted = false;

    const mountedCleanups = [];

    const getState = () => ({ ...state });
    const setState = (patch) => {
      state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
      render();
    };

    const template = (fn) => {
      view = fn;
    };

    // DOM 이벤트 헬퍼 (자동 cleanup)
    const on = (target, event, handler) => {
      if (!target) return;
      target.addEventListener(event, handler);
      unmountCallbacks.push(() => target.removeEventListener(event, handler));
    };

    const onBeforeMount = (fn) => {
      beforeMountCallbacks.push(fn);
    };

    const onMounted = (fn) => {
      mountedCallbacks.push(fn);
    };

    const onUpdated = (fn) => {
      updatedCallbacks.push(fn);
    };

    const onUnmount = (fn) => {
      unmountCallbacks.push(fn);
    };

    // 스토어 구독 헬퍼 - subscribe만 처리
    const useStore = (store) => {
      const unsubscribe = store.subscribe(() => {
        render();
      });

      mountedCleanups.push(unsubscribe);
    };

    const render = () => {
      root.innerHTML = view(state);

      // 최초 렌더링일 경우 실행
      if (!isMounted) {
        console.log(`✅ onMounted: ${options?.name || "component"}`);
        mountedCallbacks.forEach((fn) => fn && fn());
        isMounted = true;
      }

      updatedCallbacks.forEach((fn) => {
        fn();
      });
    };

    setup({ root, props, getState, setState, template, onBeforeMount, onMounted, onUnmount, onUpdated, on, useStore });

    beforeMountCallbacks.forEach((fn) => {
      fn();
    });

    const unmount = () => {
      console.log(`🧨 unmount: ${options?.name || "component"}`);
      unmountCallbacks.forEach((fn) => fn());
      mountedCleanups.forEach((fn) => fn());

      root.replaceChildren();

      unmountCallbacks.length = 0;
      mountedCleanups.length = 0;
    };

    return {
      getState,
      setState,
      unmount,
      render,
    };
  };
};

```
컴포넌트의 언마운트는... 우선 라우터에서 페이지가 바뀔 때는 언마운트를 시킨다.
이외의 경우에는 수동으로 언마운트를 해주어야 한다.
```js
const App = createComponent(({ template, onMounted, onUnmount }) => {
  template(() => /*html*/ `<div id="main-layout"></div>`);

  let mainLayout = null;
  onMounted(() => {
    mainLayout = MainLayout({ root: document.getElementById("main-layout"), options: { name: "mainLayout" } });
    mainLayout.render();
  });

  onUnmount(() => {
    mainLayout?.unmount();
  });
});
```
이런 식으로 컴포넌트를 쌓으려 했는데, 부모 컴포넌트 안에 여러 개의 자식 컴포넌트가 있을 때는 어떻게 처리해야 할지 고민이 되었다. 그럼 자식 컴포넌트의 인스턴스를 부모가 다 가지고 있어야 하고 상태도 복원해야 하겠고 모조리 다 리렌더링 되어서 성능도 별로일 것 같다. 

그정도까진 고민하지 않아도 되겠지? 하는 마음을 가지고 있었는데 다음주의 과제가 그런 쪽의 알고리즘 구현이라고 하니... 다음주에 더 깊게 고민하기로 했다.

11. 라우터 구조 변경
돌아가게는 만들어 놓고 Q&A 세션에서 라우터에 대한 부분을 보며 아차 하는 생각이 들었다. 또한 이벤트 버스도 전역적이라는 것에서 본질은 똑같았다. 어차피 정리도 해야 했으므로 기존 내용을 옵저버 패턴으로 변경하였다. 그랬더니 전체적으로 여기저기 수정해야 했고 리팩토링 하면서 e2e테스트가 여러 번 깨졌다.

https://github.com/milmilkim/front_7th_chapter2-1/commit/24154381773932e2ac3fe7c141a2657832112b4b#diff-3210ca9ed615e6f0fc1743fc09be3c86bc38178dcc050e5a41ff7982d15875b7
새 페이지를 렌더링 할 때 이전 페이지를 언마운트 하는 게 누락되어서 페이지가 언마운트 되지 않고 이벤트 리스너를 삭제하지 않아 여러 이벤트가 중첩되는 문제가 있어서 수정하였다. 
그리고 상품 목록도 쿼리 스트링 기반으로 모두 처리하게 변경했다.

이렇게 해서 바닐라 자바스크립트로 SPA를 구현해보았다.
짧은 기간 동안, SPA 그 자체에 대한 것 뿐 아니라 요구사항에 맞는 기능 구현까지 신경써야 했기 때문에 약간 아쉬움이 남아있지만 즐겁게 진행했다.
