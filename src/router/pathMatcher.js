/**
 * @see https://github.com/remix-run/react-router/blob/768919a7a04b34ceca99356fbf35c4f10a47e32a/packages/react-router/lib/router/utils.ts
 * 1. 경로 패턴을 정규식으로 변환
 * 2. URL이 패턴과 매칭되는지 확인
 */

/**
 * 경로 패턴을 정규식으로 변환
 * @param {string} pattern - 경로 패턴 (예: "/product/:id" 또는 "*")
 * @returns {RegExp} 정규식 객체
 */
export const pathToRegex = (pattern) => {
  // 1. 404 페이지용 와일드카드 "*"는 모든 경로와 매칭
  if (pattern === "*") {
    return /./;
  }

  // 2. 슬래시(/)를 정규식에서 사용하려면 이스케이프(\/) 해야 함
  const escaped = pattern.replace(/\//g, "\\/");

  // 3. 동적 파라미터(:id)를 정규식의 named capture group으로 변환
  const regexPattern = escaped.replace(/:(\w+)/g, "(?<$1>[^/]+)");

  // 4. 정확히 일치하는 경로만 매칭하도록 ^(시작)과 $(끝) 추가
  return new RegExp(`^${regexPattern}$`);
};

/**
 * URL 경로가 패턴과 매칭되는지 확인하고 파라미터 추출
 * @param {string} pattern - 경로 패턴 (예: "/product/:id")
 * @param {string} pathname - 실제 URL 경로 (예: "/product/123")
 * @returns {Object} { matched: boolean, params: Object }
 */
export const matchPath = (pattern, pathname) => {
  // 1. 패턴을 정규식으로 변환
  const regex = pathToRegex(pattern);

  // 2. 정규식으로 실제 경로와 매칭 시도
  const match = regex.exec(pathname);

  // 3. 매칭 실패 시
  if (!match) {
    return {
      matched: false,
      params: {},
    };
  }

  // 4. 매칭 성공 시 - named capture groups에서 파라미터 추출
  const params = match.groups || {};

  return {
    matched: true,
    params,
  };
};
