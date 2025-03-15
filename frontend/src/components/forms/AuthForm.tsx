import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AuthFormProps {
  title: string;
  error?: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: {
    text: string;
    to: string;
  };
  submitButton: {
    text: string;
    loading?: boolean;
  };
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  error,
  children,
  footerText,
  footerLink,
  submitButton,
  onSubmit
}) => {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={onSubmit} className="space-y-4">
              {children}
              <Button
                type="submit"
                className="w-full"
                disabled={submitButton.loading}
              >
                {submitButton.loading ? 'Please wait...' : submitButton.text}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {footerText}{' '}
              <Link to={footerLink.to} className="text-primary hover:underline">
                {footerLink.text}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;