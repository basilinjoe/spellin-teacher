import React from 'react';
import { Container } from 'react-bootstrap';
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
    <Container className={`py-4 ${className}`}>
      {error && <ErrorAlert error={error} />}
      {children}
    </Container>
  );
};

export default PageContainer;