import Component from '@/core/component';
import {
  _404_,
  상세페이지_로딩,
  상세페이지_로딩완료,
  상품목록_레이아웃_로딩,
  상품목록_레이아웃_로딩완료,
  상품목록_레이아웃_카테고리_1Depth,
  상품목록_레이아웃_카테고리_2Depth,
  장바구니_비어있음,
  장바구니_선택없음,
  장바구니_선택있음,
  토스트,
} from '@/template';

export default class TemplatePage extends Component {
  template() {
    return /* HTML */ `
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
}
