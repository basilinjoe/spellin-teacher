import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  error: string;
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
      variant="destructive"
      className={cn('mb-4', className)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {dismissible && onDismiss && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onDismiss}
            className="h-auto p-0.5 hover:bg-transparent hover:opacity-75"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;