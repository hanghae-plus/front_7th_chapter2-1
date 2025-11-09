## Description
main.js에 있는 HTML 템플릿 상수들을 별도 모듈로 분리하여 코드 가독성과 유지보수성을 향상시킵니다.

## Todo
- [ ] `src/constants/templates/` 디렉토리 생성
- [ ] 상품 목록 템플릿 분리 (`product-list-templates.js`)
  - 상품목록_레이아웃_로딩
  - 상품목록_레이아웃_로딩완료
  - 상품목록_레이아웃_카테고리_1Depth
  - 상품목록_레이아웃_카테고리_2Depth
- [ ] 장바구니 템플릿 분리 (`cart-templates.js`)
  - 장바구니_비어있음
  - 장바구니_선택없음
  - 장바구니_선택있음
- [ ] 상품 상세 템플릿 분리 (`product-detail-templates.js`)
  - 상세페이지_로딩
  - 상세페이지_로딩완료
- [ ] 공통 템플릿 분리 (`common-templates.js`)
  - 토스트
  - _404_
- [ ] main.js에서 템플릿 import 및 정리
- [ ] 파일 길이 80줄 이하 확인 (초과 시 주석 추가)

## ETC
- 현재 main.js가 1153줄로 코딩 스탠다드 80줄 제한을 크게 초과
- 템플릿 분리 후에도 향후 컴포넌트화 작업 필요
