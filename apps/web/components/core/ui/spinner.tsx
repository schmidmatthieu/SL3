import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function Spinner({ size = 24, className, ...props }: SpinnerProps) {
  return (
    <div role="status" className={cn('animate-spin', className)} {...props}>
      <Loader2 size={size} className="text-muted-foreground" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
