import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva('rounded-xl text-sm font-bold transition', {
  variants: {
    variant: {
      primary: 'bg-[#0c4795] text-white hover:bg-[#093a7c]',
      outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
      ghost: 'text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30',
    },
  },
  defaultVariants: { variant: 'primary' },
});

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />;
}
