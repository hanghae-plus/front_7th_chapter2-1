export function shallowEqual(objA, objB) {
  if (objA === objB) return true;
  if (typeof objA !== "object" || typeof objB !== "object") return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => objA[key] === objB[key]);
}
