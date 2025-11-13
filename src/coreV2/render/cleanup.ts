import { isNil, isNotNil } from "es-toolkit";
import { renderTree } from "@core/render";
import { CompnentElementNode, ElementNode } from "@core/jsx/factory";

export function cleanup(
  targetNode: ElementNode | ElementNode[] = renderTree.tree!,
) {
  if (Array.isArray(targetNode)) {
    for (const child of targetNode) {
      if (!(child instanceof ElementNode)) continue;
      cleanup(child);
    }
  } else {
    for (const child of targetNode.children) {
      if (Array.isArray(child) || child instanceof ElementNode) {
        cleanup(child);
      }
    }

    if (targetNode instanceof CompnentElementNode) {
      for (const nestedComponent of targetNode.nestedComponenets ?? []) {
        cleanup(nestedComponent);
      }
    }

    if (targetNode instanceof CompnentElementNode) {
      targetNode.sideEffects?.forEach((sideEffect) => {
        sideEffect.cleanup?.();
      });
    }
  }
  return null;
}
