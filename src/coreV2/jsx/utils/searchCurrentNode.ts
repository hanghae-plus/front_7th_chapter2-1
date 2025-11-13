import { isNil, isNotNil } from "es-toolkit";
import { CompnentElementNode, ElementNode } from "../factory";
import { renderTree } from "@core/render";

export function searchCurrentNode(
  key: string,
  targetNode: ElementNode | ElementNode[] = renderTree.tree!,
): CompnentElementNode | null {
  if (Array.isArray(targetNode)) {
    for (const child of targetNode) {
      if (!(child instanceof ElementNode)) continue;
      const found = searchCurrentNode(key, child);
      if (isNotNil(found)) return found;
    }
  } else {
    if (targetNode instanceof CompnentElementNode && key === targetNode.key)
      return targetNode;

    for (const child of targetNode.children) {
      if (Array.isArray(child) || child instanceof ElementNode) {
        const found = searchCurrentNode(key, child);
        if (isNotNil(found)) return found;
      }
    }

    if (targetNode instanceof CompnentElementNode) {
      for (const nestedComponent of targetNode.nestedComponenets ?? []) {
        const found = searchCurrentNode(key, nestedComponent);
        if (isNotNil(found)) return found;
      }
    }
  }
  return null;
}

(window as any).searchCurrentNode = searchCurrentNode;
