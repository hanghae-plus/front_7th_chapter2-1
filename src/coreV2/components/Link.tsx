import { getUrl } from "@core/router";
import { routes, Routes, useRouter } from "../../pages/routes";
import { DomNode } from "@core/jsx/factory";

type LinkProps = Omit<JSX.AnchorAttributes, "href"> & {
  to: keyof Routes;
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  children?: DomNode;
};

export function Link({
  className,
  onClick,
  to,
  pathParams,
  queryParams,
  children,
  ...props
}: LinkProps) {
  const router = useRouter();

  const url = getUrl(routes, to, { pathParams, queryParams });

  return (
    <a
      className={`${className ?? ""}`}
      {...props}
      href={url}
      onClick={(e) => {
        e.preventDefault();

        onClick?.(e);
        router.push<keyof Routes>(
          to as keyof Routes,
          { pathParams, queryParams } as any,
        );
      }}
    >
      {children}
    </a>
  );
}
