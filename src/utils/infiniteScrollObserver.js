/**
 * 무한 스크롤 옵저버 모듈
 * IntersectionObserver를 사용하여 로딩 트리거 엘리먼트를 감지합니다.
 */

import { getInfiniteScrollState } from "./infiniteScrollState.js";

// 전역 옵저버 인스턴스
let observer = null;

/**
 * 무한 스크롤 옵저버를 초기화합니다.
 * @param {Function} onIntersect - 엘리먼트가 화면에 보일 때 실행할 콜백 함수
 * @param {string} targetSelector - 감지할 엘리먼트의 CSS 셀렉터
 */
export const initInfiniteScrollObserver = (onIntersect, targetSelector = "#infinite-scroll-loading") => {
  // 기존 옵저버가 있으면 정리
  cleanupInfiniteScrollObserver();

  const targetElement = document.querySelector(targetSelector);
  if (!targetElement) {
    console.error(`Target element not found: ${targetSelector}`);
    return;
  }

  // IntersectionObserver 옵션
  const options = {
    root: null, // viewport를 기준으로
    rootMargin: "0px 0px 100px 0px", // 하단 100px 전에 트리거
    threshold: 0.1, // 10% 이상 보이면 트리거
  };

  // Observer 콜백
  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const state = getInfiniteScrollState();
        // 무한 스크롤이 활성화되어 있고, 로딩 중이 아니며, 다음 페이지가 있을 때만 실행
        if (state.isEnabled && !state.isLoading && state.hasNext) {
          onIntersect();
        }
      }
    });
  };

  // Observer 생성 및 감지 시작
  observer = new IntersectionObserver(observerCallback, options);
  observer.observe(targetElement);
};

/**
 * 무한 스크롤 옵저버를 정리합니다.
 * 페이지 전환 시 호출되어야 합니다.
 */
export const cleanupInfiniteScrollObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};
