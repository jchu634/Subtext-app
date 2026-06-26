import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      className={cn("h-full w-full gap-4 p-1", className)}
      {...props}
    />
  );
}

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof Panel>) {
  return <Panel className={cn("min-w-0", className)} {...props} />;
}

function ResizableHandle({
  className,
  withHandle = true,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) {
  return (
    <Separator
      className={cn(
        "relative flex w-2.5 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent/40 data-[orientation=vertical]:h-2.5 data-[orientation=vertical]:w-full focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="flex h-8 w-1 items-center justify-center rounded-full bg-border">
          <div className="h-4 w-px bg-muted-foreground/40" />
        </div>
      )}
    </Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
