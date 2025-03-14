import React from 'react';
import ErrorAlert from './ErrorAlert';

interface PageContainerProps {
  children: React.ReactNode;
  error?: string;
  loading?: boolean;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  error,
  loading,
  className = ''
}) => {
  return (
    <div className={`container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
      {error && <ErrorAlert error={error} />}
      {children}
    </div>
  );
};

export default PageContainer;