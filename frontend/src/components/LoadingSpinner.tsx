import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', center = true }) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return '1.5rem';
      case 'lg': return '4rem';
      default: return '3rem';  // md
    }
  };

  const spinner = (
    <div 
      className="spinner-border" 
      role="status"
      style={{ width: getSize(), height: getSize() }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );

  if (center) {
    return (
      <div className="text-center p-5">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;