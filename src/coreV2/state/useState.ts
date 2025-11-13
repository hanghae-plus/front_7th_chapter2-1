import { assert, cloneDeep, isNil, isNotNil } from "es-toolkit";
import { CompnentElementNode } from "@core/jsx/factory";
import { searchCurrentNode } from "@core/jsx/utils/searchCurrentNode";
import { currentRenderingNode, render, renderTree } from "@core/render";

export function useState<T>(
  initialValue: T,
): [T, (valueOrDispatcher: T | ((value: T) => T)) => void] {
  if (!(currentRenderingNode instanceof CompnentElementNode)) {
    throw new Error("currentRenderingNode is not an object");
  }

  if (
    isNil(currentRenderingNode.state) ||
    isNil(currentRenderingNode.stateCursor)
  ) {
    throw new Error("parentNode.state or parentNode.stateCursor is not set");
  }

  const { key, state, stateCursor } = currentRenderingNode;

  state[stateCursor] = state[stateCursor] ?? initialValue;
  currentRenderingNode.stateCursor++;

  if (typeof state[stateCursor] === "object") {
    Object.freeze(state[stateCursor]);
  }

  function setValue(valueOrDispatcher: T | ((value: T) => T)) {
    const parentNode = searchCurrentNode(key);

    assert(isNotNil(parentNode), "parentNode is not found");
    assert(isNotNil(parentNode.state), "parentNode.state is not set");

    if (typeof valueOrDispatcher === "function") {
      const dispatcher = valueOrDispatcher as (value: T) => T;
      parentNode.state[stateCursor] = dispatcher(cloneDeep(state[stateCursor]));
    } else {
      const value = valueOrDispatcher as T;
      parentNode.state[stateCursor] = value;
    }

    queueMicrotask(() => {
      render(parentNode, parentNode.parent, "");
    });
  }

  return [state[stateCursor], setValue];
}
