import {
  CompnentElementNode,
  DomElementNode,
  DomNode,
  ElementNode,
  FragmentNode,
} from "@core/jsx/factory";
import { searchCurrentNode } from "@core/jsx/utils/searchCurrentNode";
import { isNil, isNotNil, kebabCase, lowerCase } from "es-toolkit";

export let renderTree: ElementNode | null = null;

export let currentRenderingNode: DomNode = null;

export function render(
  jsx: DomNode | DomNode[],
  parent: HTMLElement | DocumentFragment = root(),
  path: string = "root",
  onAppend?: (callback: (componentNode: CompnentElementNode) => void) => void,
): void {
  if (Array.isArray(jsx)) {
    jsx.forEach((child, idx) => {
      render(child, parent, `${path}[${idx}]`, onAppend);
    });
    return;
  }

  if (isNil(renderTree)) {
    renderTree = jsx as ElementNode;
    (window as any).renderTree = renderTree;
  }

  if (typeof jsx === "boolean" || jsx == null) {
    return;
  }

  if (!(jsx instanceof ElementNode)) {
    const text = document.createTextNode(String(jsx));
    parent.appendChild(text);
    return;
  }

  jsx.key =
    path === ""
      ? jsx.key
      : isNil(jsx.key) || jsx.key === ""
        ? `${path}`
        : `${path}.${jsx.key}`;

  if (jsx instanceof CompnentElementNode) {
    const target = searchCurrentNode(jsx.key) ?? jsx;

    currentRenderingNode = target;
    jsx.parent = parent;
    jsx.state = jsx.state ?? [];
    jsx.stateCursor = 0;
    jsx.sideEffects = jsx.sideEffects ?? [];
    jsx.sideEffectsCursor = 0;

    target?.nodes?.forEach((node) => {
      node.remove();
    });

    const rendered = jsx.tag({ ...jsx.props, children: jsx.children });

    if (
      rendered instanceof CompnentElementNode ||
      rendered instanceof FragmentNode
    ) {
      jsx.nestedComponenets = jsx.nestedComponenets ?? [rendered];
    }

    if (rendered instanceof ElementNode) {
      jsx.nestedComponenets =
        jsx.nestedComponenets ??
        (rendered.children.filter(
          (child) =>
            child instanceof CompnentElementNode ||
            child instanceof FragmentNode,
        ) as (CompnentElementNode | FragmentNode)[]);
    }

    render(rendered, parent, jsx.key, (callback) => {
      callback(target);
    });
    return;
  }

  if (jsx instanceof FragmentNode) {
    jsx.children.forEach((child, idx) => {
      render(child, parent, `${path}[${idx}]`, onAppend);
    });
    return;
  }

  if (!(jsx instanceof DomElementNode)) {
    throw new Error("jsx is not a DomElementNode");
  }

  const element = document.createElement(jsx.tag);
  for (const [key, value] of Object.entries(jsx.props ?? {}).filter(
    (key) => !String(key).startsWith("__"),
  )) {
    if (key === "key") {
      continue;
    }

    if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(
        lowerCase(key.replace("on", "")),
        value as EventListener,
      );
      continue;
    }

    if (key === "className") {
      element.setAttribute("class", value as string);
      continue;
    }

    element.setAttribute(kebabCase(key), value as string);
  }

  element.setAttribute("data-jsx-key", jsx.key);

  if (isNotNil(onAppend)) {
    onAppend?.((componentNode) => {
      if (isNil(componentNode.nodes)) {
        componentNode.nodes = [];
      }
      componentNode.nodes?.push(element);
      parent.appendChild(element);
    });
  } else {
    parent.appendChild(element);
  }

  for (const [idx, child] of jsx.children.entries()) {
    render(child, element, `${path}[${idx}]`);
  }
}

function root(): HTMLElement {
  return document.querySelector("#root") as HTMLElement;
}
