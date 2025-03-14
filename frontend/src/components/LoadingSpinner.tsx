import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', center = true }) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-12 w-12';
      default: return 'h-8 w-8'; // md
    }
  };

  const spinner = (
    <Loader2 
      className={cn(
        'animate-spin',
        getSize()
      )}
    />
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