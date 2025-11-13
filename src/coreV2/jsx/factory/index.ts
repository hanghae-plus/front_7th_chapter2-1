import { CallbackReturn } from "@core/state/useEffect";
import { isNil } from "es-toolkit";
import { nanoid } from "nanoid";

export type DomNode =
  | string
  | number
  | boolean
  | null
  | undefined
  | {
      tag: string | typeof Fragment | ((...args: any[]) => DomNode);
      props?: any;
      children: DomNode[];
      state?: Array<any>;
      stateCursor?: number;
      parent?: HTMLElement | DocumentFragment;
      key?: any;
    };

export class ElementNode {
  constructor(
    public tag: unknown,
    public children: DomNode[],
    public key?: any,
  ) {}
}

export class FragmentNode extends ElementNode {
  constructor(
    public tag: "Fragment",
    public children: DomNode[],
    public key?: any,
  ) {
    super("Fragment", children);
  }
}

export class DomElementNode extends ElementNode {
  constructor(
    public tag: string,
    public props: { [key: string]: unknown },
    public children: DomNode[],
    public key?: any,
  ) {
    super(tag, children);
  }
}
export class CompnentElementNode extends ElementNode {
  constructor(
    public key: any,
    public tag: (...args: any[]) => DomNode,
    public props: { [key: string]: unknown },
    public children: DomNode[],
    public state?: Array<any>,
    public stateCursor?: number,
    public sideEffects?: Array<{
      cleanup?: () => void;
      callback: () => CallbackReturn;
      dependencies: any[];
    }>,
    public sideEffectsCursor?: number,
    public parent?: HTMLElement | DocumentFragment,
    public nodes?: HTMLElement[],
    public nestedComponenets?: (CompnentElementNode | FragmentNode)[],
  ) {
    super(tag, children);
  }
}

export function h(
  tag: string | ((...args: any[]) => DomNode),
  props: { [key: string]: unknown },
  ...children: DomNode[]
): DomNode {
  if (typeof tag === "function" && tag.name === "Fragment") {
    return Fragment(props, ...mapKeyToChildren(children));
  }

  if (typeof tag === "function") {
    return new CompnentElementNode(
      String(props?.key ?? ""),
      tag,
      props,
      mapKeyToChildren(children),
    );
  }

  return new DomElementNode(
    tag,
    props,
    mapKeyToChildren(children),
    String(props?.key ?? ""),
  );
}

export function Fragment(_: {}, ...children: DomNode[]): DomNode {
  return new FragmentNode("Fragment", children);
}

function mapKeyToChildren(children: DomNode[]): DomNode[] {
  return children.map((child, idx) => {
    if (typeof child !== "object" || isNil(child)) {
      return child;
    }

    child.key =
      isNil(child?.key) || child?.key === "" ? `idx:${idx}` : child.key;

    return child;
  });
}
