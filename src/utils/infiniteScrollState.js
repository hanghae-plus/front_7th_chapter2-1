/**
 * 무한 스크롤 상태 관리 모듈
 * 페이지 번호, 로딩 상태, hasNext 여부를 전역으로 관리합니다.
 */

// 무한 스크롤 상태
let infiniteScrollState = {
  currentPage: 1, // 현재 로드된 페이지 번호
  isLoading: false, // 로딩 중 여부
  hasNext: true, // 다음 페이지가 있는지 여부
  isEnabled: false, // 무한 스크롤 활성화 여부 (HomePage에서만 true)
};

/**
 * 현재 무한 스크롤 상태를 조회합니다.
 * @returns {Object} 현재 무한 스크롤 상태
 */
export const getInfiniteScrollState = () => {
  return { ...infiniteScrollState };
};

/**
 * 무한 스크롤 상태를 업데이트합니다.
 * @param {Object} updates - 업데이트할 상태 (부분 업데이트 가능)
 */
export const updateInfiniteScrollState = (updates) => {
  infiniteScrollState = {
    ...infiniteScrollState,
    ...updates,
  };
};

/**
 * 무한 스크롤 상태를 초기화합니다.
 * 필터나 검색어가 변경될 때 호출됩니다.
 */
export const resetInfiniteScrollState = () => {
  infiniteScrollState = {
    currentPage: 1,
    isLoading: false,
    hasNext: true,
    isEnabled: infiniteScrollState.isEnabled, // 활성화 상태는 유지
  };
};

/**
 * 무한 스크롤을 활성화합니다.
 * HomePage에서만 호출됩니다.
 */
export const enableInfiniteScroll = () => {
  infiniteScrollState.isEnabled = true;
};

/**
 * 무한 스크롤을 비활성화합니다.
 * 다른 페이지로 전환될 때 호출됩니다.
 */
export const disableInfiniteScroll = () => {
  infiniteScrollState.isEnabled = false;
  resetInfiniteScrollState();
};
