import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { popIn, easeTransition } from '@/lib/animations';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
  className?: string;
  delay?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  center = true,
  className = '',
  delay = 0
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-12 w-12';
      default: return 'h-8 w-8';
    }
  };

  const spinner = (
    <motion.div
      variants={popIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        ...easeTransition,
        delay
      }}
    >
      <Loader2 
        className={cn(
          'animate-spin text-muted-foreground/70',
          getSize(),
          className
        )}
      />
    </motion.div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center p-8">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;