import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/15 text-primary border-primary/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-accent/15 text-accent border-accent/30',
  destructive: 'bg-destructive/15 text-destructive border-destructive/30',
  outline: 'border-border text-foreground',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] tracking-[0.1em] font-medium border',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
