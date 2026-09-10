import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface IButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, IButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        data-slot="button-group"
        data-orientation={orientation}
        className={cn(
          "inline-flex items-stretch focus-within:z-10",
          orientation === "horizontal"
            ? "flex-row [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-px"
            : "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px",
          className
        )}
        {...props}
      />
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

export interface IButtonGroupSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroupSeparator: React.FC<IButtonGroupSeparatorProps> = ({
  className,
  orientation = "vertical",
  ...props
}) => {
  return (
    <div
      data-slot="button-group-separator"
      className={cn(
        orientation === "vertical" ? "w-px self-stretch bg-slate-200 dark:bg-slate-800 my-1" : "h-px w-full bg-slate-200 dark:bg-slate-800 mx-1",
        className
      )}
      {...props}
    />
  );
};
