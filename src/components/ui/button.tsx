import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'neon';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-pink',
  secondary: 'bg-muted text-foreground hover:bg-muted/80',
  ghost: 'hover:bg-muted text-foreground',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
  outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
  neon: 'border border-primary text-primary hover:bg-primary/10 neon-glow-pink',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs tracking-[0.1em]',
  md: 'h-10 px-4 text-sm tracking-[0.05em]',
  lg: 'h-12 px-6 text-sm tracking-[0.1em]',
  icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
