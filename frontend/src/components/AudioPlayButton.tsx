import React from 'react';
import { Button } from './ui/button';

interface AudioPlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  onClick,
  disabled = false,
  size = 'lg',
  className = ''
}) => {
  return (
    <div className="text-center mb-4">
      <Button
        variant="default"
        size={size}
        className={`practice-audio-button ${className}`}
        onClick={onClick}
        disabled={disabled}
        title="Click or press Space to play audio"
      >
        <i className="fas fa-volume-up fa-3x"></i>
      </Button>
      <p className="mt-3">
        Click or press <kbd>Space</kbd> to hear the word
      </p>
    </div>
  );
};

export default AudioPlayButton;