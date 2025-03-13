import React from 'react';
import { Form, Button } from 'react-bootstrap';

interface AuthFormProps {
  email: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitText: string;
  loadingText: string;
  showPasswordConfirm?: boolean;
  confirmPassword?: string;
  onConfirmPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading = false,
  submitText,
  loadingText,
  showPasswordConfirm = false,
  confirmPassword = '',
  onConfirmPasswordChange
}) => {
  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3" controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={onEmailChange}
          required
        />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
          required
          minLength={6}
        />
      </Form.Group>

      {showPasswordConfirm && onConfirmPasswordChange && (
        <Form.Group className="mb-4" controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            required
          />
        </Form.Group>
      )}

      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? loadingText : submitText}
        </Button>
      </div>
    </Form>
  );
};

export default AuthForm;