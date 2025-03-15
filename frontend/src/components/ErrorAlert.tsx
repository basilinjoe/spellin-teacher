import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { slideIn, springTransition } from '@/lib/animations';

interface ErrorAlertProps {
  error: any;
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

  const errorMessage = typeof error === 'object' 
    ? (error.message || error.msg || JSON.stringify(error)) 
    : String(error);

  return (
    <AnimatePresence>
      <motion.div
        variants={slideIn}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={springTransition}
      >
        <Alert 
          variant="destructive"
          className={cn(
            'mb-4 shadow-lg border-destructive/50',
            'backdrop-blur-sm bg-destructive/5',
            className
          )}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="flex-1">{errorMessage}</span>
            {dismissible && onDismiss && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onDismiss}
                className="h-auto p-0.5 hover:bg-transparent hover:opacity-75 shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorAlert;