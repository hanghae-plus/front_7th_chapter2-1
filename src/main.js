import { enableMocking } from './utils/enable-mocking.js';

import {
  장바구니_비어있음,
  장바구니_선택없음,
  장바구니_선택있음,
} from './constants/templates/cart-templates.js';
import { 토스트, _404_ } from './constants/templates/common-templates.js';
import {
  상세페이지_로딩,
  상세페이지_로딩완료,
} from './constants/templates/product-detail-templates.js';
import {
  상품목록_레이아웃_로딩,
  상품목록_레이아웃_로딩완료,
  상품목록_레이아웃_카테고리_1Depth,
  상품목록_레이아웃_카테고리_2Depth,
} from './constants/templates/product-list-template.js';

function main() {
  document.body.innerHTML = `
    ${상품목록_레이아웃_로딩}
    <br />
    ${상품목록_레이아웃_로딩완료}
    <br />
    ${상품목록_레이아웃_카테고리_1Depth}
    <br />
    ${상품목록_레이아웃_카테고리_2Depth}
    <br />
    ${토스트}
    <br />
    ${장바구니_비어있음}
    <br />
    ${장바구니_선택없음}
    <br />
    ${장바구니_선택있음}
    <br />
    ${상세페이지_로딩}
    <br />
    ${상세페이지_로딩완료}
    <br />
    ${_404_}
  `;
}

if (import.meta.env.MODE !== 'test') {
  enableMocking().then(main);
} else {
  main();
}
