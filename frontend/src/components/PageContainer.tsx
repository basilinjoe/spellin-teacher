import React from 'react';
import ErrorAlert from './ErrorAlert';
import { LoadingSpinner } from '.';
import { cn } from '@/lib/utils';
import { PageTransition } from './PageTransition';

interface PageContainerProps {
  children: React.ReactNode;
  error?: string;
  loading?: boolean;
  className?: string;
  onDismissError?: () => void;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  error,
  loading,
  className = '',
  onDismissError
}) => {
  return (
    <PageTransition
      className={cn(
        "container max-w-7xl mx-auto space-y-6",
        "px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10",
        className
      )}
    >
      {error && (
        <ErrorAlert
          error={error}
          onDismiss={onDismissError}
          className="animate-in slide-in-from-top-2 duration-300"
        />
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" delay={0.1} />
        </div>
      ) : (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </PageTransition>
  );
};

export default PageContainer;