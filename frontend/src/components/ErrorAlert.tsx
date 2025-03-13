import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      variant="destructive"
      className={cn('mb-4', className)}
    >
      <AlertDescription className="flex items-center justify-between">
        {error}
        {dismissible && onDismiss && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDismiss}
            className="h-auto p-0 hover:bg-transparent"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;