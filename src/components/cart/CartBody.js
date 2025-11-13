import { CartEmpty, CartSelectAll, CartItemList } from '@/components';

export const CartBody = (
  items,
  checkedItems = new Set(),
  isAllSelected = false,
) => {
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return /* HTML */ ` ${CartEmpty()} `;
  }

  return /* HTML */ `
    ${CartSelectAll(items.length, isAllSelected)}
    ${CartItemList(items, checkedItems)}
  `;
};
