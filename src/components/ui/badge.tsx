import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border border-transparent px-2 py-0.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "text-foreground border-border",
        // Status variants - subtle backgrounds with tinted borders
        success:
          "bg-success-bg text-success border-success-border",
        warning:
          "bg-warning-bg text-warning border-warning-border",
        error:
          "bg-error-bg text-error border-error-border",
        // Subtle variants (even lighter)
        "success-subtle":
          "bg-success/8 text-success",
        "warning-subtle":
          "bg-warning/8 text-warning",
        "error-subtle":
          "bg-error/8 text-error",
        // Processing/pending states
        processing:
          "bg-primary/10 text-primary border-primary/20",
        pending:
          "bg-muted text-muted-foreground border-border",
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
