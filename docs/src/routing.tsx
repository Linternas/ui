import { useEffect, useState, type ComponentProps } from "react";
export const docsPath = (href: string) =>
  href === "/lab/ui"
    ? "/"
    : href.startsWith("/lab/ui/")
      ? href.slice("/lab/ui".length)
      : href;
function navigate(href: string) {
  history.pushState(null, "", docsPath(href));
  dispatchEvent(new Event("mingu:navigate"));
}
export function useRouter() {
  return { push: navigate };
}
export function usePathname() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const update = () => setPath(location.pathname);
    addEventListener("popstate", update);
    addEventListener("mingu:navigate", update);
    return () => {
      removeEventListener("popstate", update);
      removeEventListener("mingu:navigate", update);
    };
  }, []);
  return path;
}
export default function Link({
  href = "",
  onClick,
  ...props
}: ComponentProps<"a">) {
  const target = docsPath(href);
  return (
    <a
      {...props}
      href={target}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          props.target === "_blank" ||
          !target.startsWith("/") ||
          target.startsWith("//")
        )
          return;
        e.preventDefault();
        navigate(target);
      }}
    />
  );
}
