import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './Card';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  indicatorColor?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorColor = 'bg-primary', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn("h-full w-full flex-1 transition-all", indicatorColor)}
          initial={{ x: '-100%' }}
          animate={{ x: `-${100 - (value || 0)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
