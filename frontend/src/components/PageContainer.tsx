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
    <div className={`container py-4 ${className}`}>
      {error && <ErrorAlert error={error} />}
      {children}
    </div>
  );
};

export default PageContainer;