import React from 'react';
import { Alert } from 'react-bootstrap';

interface ErrorAlertProps {
  error?: string | null;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  dismissible = true, 
  onDismiss,
  className = ''
}) => {
  if (!error) return null;

  return (
    <Alert 
      variant="danger" 
      dismissible={dismissible}
      onClose={onDismiss}
      className={`mb-4 ${className}`}
    >
      {error}
    </Alert>
  );
};

export default ErrorAlert;