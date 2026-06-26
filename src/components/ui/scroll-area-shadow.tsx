import * as React from "react";

import { cn } from "@/lib/utils";

export function ScrollAreaShadow({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shadows, setShadows] = React.useState({ top: false, bottom: false });

  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const atTop = el.scrollTop <= 0;
    const atBottom = Math.abs(
      el.scrollTop + el.clientHeight - el.scrollHeight,
    ) <= 1;
    setShadows({ top: !atTop, bottom: !atBottom });
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  return (
    <div
      ref={ref}
      onScroll={update}
      data-slot="scroll-area-shadow"
      className={cn(
        "relative overflow-auto",
        shadows.top &&
          "shadow-[inset_0_18px_10px_-8px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_18px_10px_-8px_rgba(255,255,255,0.25)]",
        shadows.bottom &&
          "shadow-[inset_0_-18px_10px_-8px_rgba(0,0,0,0.3)] dark:shadow-[inset_0_-18px_10px_-8px_rgba(255,255,255,0.25)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
