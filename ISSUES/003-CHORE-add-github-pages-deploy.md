## Description
GitHub Pages 배포를 위한 설정을 추가합니다.

## Todo
- [x] `gh-pages` 패키지 설치
- [x] `package.json`에 homepage 필드 추가
- [x] `package.json`에 deploy 스크립트 추가
- [x] Vite base path 설정 수정 (빈 화면 이슈 해결)
- [x] MSW service worker 경로 설정 (프로덕션 환경 지원)
- [x] 코드 리뷰 완료

## ETC
- homepage: https://joshuayeyo.github.io/hh-week4
- deploy:pre로 빌드 후 deploy로 배포
- Vite base path: `/hh-week4/` (GitHub Pages 경로 지원)
- MSW service worker: 환경별 동적 경로 설정 (`${BASE_URL}mockServiceWorker.js`)