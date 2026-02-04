import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "text-foreground border-border",
        // Status variants - optimized for both light and dark mode
        success:
          "border-success-border bg-success-bg text-success dark:shadow-glow-success",
        warning:
          "border-warning-border bg-warning-bg text-warning dark:shadow-glow-warning",
        error:
          "border-error-border bg-error-bg text-error dark:shadow-glow-error",
        // Subtle variants (less prominent)
        "success-subtle":
          "border-transparent bg-success/10 text-success",
        "warning-subtle":
          "border-transparent bg-warning/10 text-warning",
        "error-subtle":
          "border-transparent bg-error/10 text-error",
        // Processing/pending states
        processing:
          "border-primary/30 bg-primary/10 text-primary",
        pending:
          "border-muted-foreground/30 bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
