import {
  CompnentElementNode,
  DomElementNode,
  DomNode,
  ElementNode,
  FragmentNode,
} from "@core/jsx/factory";
import { searchCurrentNode } from "@core/jsx/utils/searchCurrentNode";
import { cloneDeep, isNil, isNotNil, kebabCase, lowerCase } from "es-toolkit";

export const renderTree: { tree: ElementNode | null; raw: ElementNode | null } =
  { tree: null, raw: null };

export let currentRenderingNode: DomNode = null;

export function render(
  jsx: DomNode | DomNode[],
  parent: HTMLElement | DocumentFragment = root(),
  path: string = "root",
  onAppend?: (
    callback: (componentNode: CompnentElementNode, position: number) => void,
  ) => void,
): void {
  if (Array.isArray(jsx)) {
    jsx.forEach((child, idx) => {
      render(child, parent, `${path}[${idx}]`, onAppend);
    });
    return;
  }

  if (isNil(renderTree.tree)) {
    renderTree.tree = jsx as ElementNode;
    (window as any).renderTree = renderTree;
  }

  if (isNil(renderTree.raw)) {
    renderTree.raw = cloneDeep(jsx as ElementNode);
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
    target.parent = syncParent(parent);
    target.state = target.state ?? [];
    target.stateCursor = 0;
    target.sideEffects = target.sideEffects ?? [];
    target.sideEffectsCursor = 0;

    const firstChild = target?.nodes?.[0];

    const position = isNotNil(firstChild)
      ? [...(target.parent?.children ?? [])].indexOf(firstChild)
      : -1;

    target?.nodes?.forEach((node) => {
      node.remove();
    });

    target.nodes = [];

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
      callback(target, position);
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

  const svgTags = [
    "svg",
    "path",
    "defs",
    "linearGradient",
    "stop",
    "filter",
    "feDropShadow",
    "g",
    "line",
    "polyline",
    "polygon",
    "ellipse",
    "rect",
    "text",
  ];

  const element = svgTags.includes(jsx.tag)
    ? document.createElementNS("http://www.w3.org/2000/svg", jsx.tag)
    : document.createElement(jsx.tag);
  for (const [key, value] of Object.entries(jsx.props ?? {}).filter(
    (key) => !String(key).startsWith("__"),
  )) {
    if (key === "key") {
      continue;
    }

    if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(
        lowerCase(key.replace("on", "")).replace(/\s/g, ""),
        value as EventListener,
      );
      continue;
    }

    if (key === "className") {
      element.setAttribute("class", value as string);
      continue;
    }

    if (key === "style") {
      const styleObject = value as Record<string, string>;
      const stringifiedStyle = Object.entries(styleObject)
        .map(([key, value]) => `${kebabCase(key)}: ${value}`)
        .join(";");
      element.setAttribute("style", stringifiedStyle);
      continue;
    }

    if (key === "checked") {
      if (value) {
        element.setAttribute("checked", "true");
      }
      continue;
    }

    if (jsx.tag === "option" && key === "selected") {
      if (value) {
        element.setAttribute("selected", "true");
      }
      continue;
    }

    if (key === "viewBox") {
      element.setAttributeNS(null, "viewBox", value as string);
      continue;
    }

    if (svgTags.includes(jsx.tag)) {
      element.setAttributeNS(null, kebabCase(key), value as string);
      continue;
    }

    element.setAttribute(kebabCase(key), value as string);
  }

  jsx.key = jsx.props.key ?? jsx.key;

  if (!svgTags.includes(jsx.tag)) {
    element.setAttribute("data-jsx-key", jsx.key);
  }

  if (isNotNil(onAppend)) {
    onAppend?.((componentNode, position) => {
      let targetParent = parent;

      if (parent instanceof HTMLElement) {
        targetParent = document.querySelector(
          `[data-jsx-key="${parent.dataset.jsxKey}"]`,
        ) as HTMLElement;
      }
      if (isNil(componentNode.nodes)) {
        componentNode.nodes = [];
      }
      componentNode.nodes?.push(element as HTMLElement);
      if (position === -1) {
        targetParent.appendChild(element);
      } else {
        targetParent.insertBefore(element, targetParent.children[position]);
      }
    });
  } else {
    parent.appendChild(element);
  }

  for (const [idx, child] of jsx.children.entries()) {
    render(child, element as HTMLElement, `${path}[${idx}]`);
  }
}

function root(): HTMLElement {
  return document.querySelector("#root") as HTMLElement;
}

function syncParent(parent: HTMLElement | DocumentFragment) {
  if (parent instanceof DocumentFragment) {
    return parent;
  }

  const targetParent = document.querySelector(
    `[data-jsx-key="${parent.dataset.jsxKey}"]`,
  ) as HTMLElement;
  return targetParent ?? parent;
}
