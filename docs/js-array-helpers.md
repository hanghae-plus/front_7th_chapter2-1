# 자주 사용하는 배열 헬퍼 함수 정리

자바스크립트에서 배열을 다룰 때 가장 많이 사용하는 고차 함수들을 간단한 예제와 함께 정리했습니다. 모든 예제는 ES6 이상의 환경을 기준으로 작성되었습니다.

---

## 1. `Array.prototype.map()`

- **용도**: 각 요소를 다른 값으로 변환해 **새로운 배열**을 만든다.
- **반환값**: 변환된 요소를 가진 새 배열.

```javascript
const prices = [1000, 2000, 3000];
const formatted = prices.map((price) => `${price.toLocaleString()}원`);
// ['1,000원', '2,000원', '3,000원']
```

- 주의: 원본 배열은 변경되지 않는다.
- 활용: UI 렌더링용 데이터 변환, 객체 배열에서 특정 필드만 추출 등.

---

## 2. `Array.prototype.filter()`

- **용도**: 조건을 만족하는 요소만 골라 **새로운 배열**을 만든다.
- **반환값**: 조건을 통과한 요소를 모은 새 배열.

```javascript
const products = [
  { title: "노트북", inStock: true },
  { title: "키보드", inStock: false },
];

const available = products.filter((product) => product.inStock);
// [{ title: '노트북', inStock: true }]
```

- 주의: 조건을 통과한 요소가 없다면 빈 배열을 반환한다.
- 활용: 리스트 필터링, 검색 결과 추리기 등.

---

## 3. `Array.prototype.reduce()`

- **용도**: 배열을 순회하며 누적 연산을 수행하고 **단일 값**을 만든다.
- **반환값**: 누적 결과 값(숫자, 문자열, 객체 등 자유롭게 가능).

```javascript
const cart = [
  { name: "마우스", price: 15000 },
  { name: "헤드셋", price: 45000 },
];

const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);
// 60000
```

- 두 번째 인자로 초기값을 전달하지 않으면 첫 요소가 초기값이 된다.
- 활용: 합계, 평균, 그룹화 등 고급 집계 로직.

---

## 4. `Array.prototype.find()`

- **용도**: 조건을 만족하는 **첫 번째 요소**를 찾는다.
- **반환값**: 조건을 만족하는 요소 혹은 `undefined`.

```javascript
const items = [
  { id: "A1", name: "샴푸" },
  { id: "B2", name: "칫솔" },
];

const target = items.find((item) => item.id === "B2");
// { id: 'B2', name: '칫솔' }
```

- 조건을 만족하는 요소가 없다면 `undefined`.
- 활용: 상세 페이지 이동 시 특정 상품 찾기, ID 기반 조회 등.

---

## 5. `Array.prototype.some()` / `Array.prototype.every()`

- `some()` **용도**: 하나라도 조건을 만족하면 `true`.
- `every()` **용도**: 모든 요소가 조건을 만족해야 `true`.

```javascript
const stockCounts = [10, 0, 3];

const hasSoldOut = stockCounts.some((count) => count === 0); // true
const allInStock = stockCounts.every((count) => count > 0); // false
```

- 활용: 폼 유효성 검사, 재고 여부 판단, 접근 권한 체크 등.

---

## 6. `Array.prototype.sort()`

- **용도**: 배열을 제자리에서 정렬한다.
- **반환값**: 정렬된 **원본 배열**(정렬 후 참조는 동일).

```javascript
const numbers = [3, 1, 2];
numbers.sort((a, b) => a - b); // [1, 2, 3]
```

- 주의:
  - 기본 정렬은 문자열 기준이므로 숫자는 비교 함수를 작성해야 한다.
  - 원본 배열이 변경되므로 복사본을 만들어 사용하거나 주의해서 다뤄야 한다.
- 활용: 가격 정렬, 이름순 정렬 등.

---

## 7. 참고: 체이닝 패턴

- 여러 함수를 이어서 사용할 수 있다.

```javascript
const result = products
  .filter((product) => product.category === "디지털/가전")
  .map((product) => ({
    ...product,
    formattedPrice: `${Number(product.lprice).toLocaleString()}원`,
  }));
```

- 체이닝 시 각 단계에서 새 배열이 만들어지므로, 데이터량이 많다면 중간에 `reduce()`로 묶거나 성능을 고려한 최적화가 필요할 수 있다.

---

## 요약

- `map`, `filter`, `reduce`는 배열을 **새로운 값으로 변환**하는 고차 함수의 기본.
- `find`, `some`, `every`는 조건 검사용.
- `sort`는 원본 배열을 수정하므로 복사본을 만드는 게 안전할 때가 많다.
- 체이닝을 활용하면 선언형 스타일로 로직을 읽기 쉽게 작성할 수 있다.

필요에 따라 이 문서를 확장하거나, 프로젝트에서 사용하는 실제 예제를 추가해 나가면 좋습니다.


