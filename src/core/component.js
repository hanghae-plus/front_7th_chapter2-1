/**
 * 컴포넌트 생성 함수
 * @param {Object} options - 컴포넌트 옵션
 * @param {Function} options.template - 템플릿 함수 (props를 받아 HTML 문자열 반환)
 * @param {Function} options.setup - 데이터 로드 함수 (비동기, props를 받아 데이터 반환)
 * @param {Function} options.mounted - 마운트 후 실행 함수 (이벤트 핸들러 연결 등)
 * @returns {Object} 컴포넌트 객체
 */
export function createComponent({ template, setup, mounted }) {
  /**
   * 컴포넌트 렌더링 (로딩 상태 포함)
   * @param {Object} props - 컴포넌트 props
   * @param {boolean} loading - 로딩 상태
   * @returns {string} HTML 문자열
   */
  const render = (props = {}, loading = false) => {
    return template({ ...props, loading });
  };

  /**
   * 컴포넌트 마운트 (렌더링 + 데이터 로드 + 이벤트 핸들러 연결)
   * @param {Object} props - 컴포넌트 props
   * @param {HTMLElement} container - 렌더링할 컨테이너
   * @returns {Promise<void>}
   */
  const mount = async (props = {}, container) => {
    if (!container) return;

    // 1. 로딩 UI 먼저 렌더링
    const loadingHTML = render(props, true);
    container.innerHTML = loadingHTML;

    // 2. 데이터 로드 (setup 함수가 있으면)
    let pageData = {};
    if (setup) {
      pageData = await setup(props);
    }

    // 3. 실제 데이터로 렌더링
    const html = render({ ...props, ...pageData }, false);
    container.innerHTML = html;

    // 4. 마운트 후 실행 (이벤트 핸들러 연결 등)
    if (mounted) {
      mounted();
    }
  };

  return {
    render,
    mount,
  };
}
