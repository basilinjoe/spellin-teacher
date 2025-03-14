import React from 'react';
import { Button } from './ui/button';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const getSize = () => {
    return size === 'lg' ? 'h-32 w-32' : 'h-24 w-24';
  };

  return (
    <div className="flex flex-col items-center gap-3 mb-4">
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'rounded-full transition-transform hover:scale-105 active:scale-95',
          getSize(),
          className
        )}
        onClick={onClick}
        disabled={disabled}
        title="Click or press Space to play audio"
      >
        <Volume2 className={cn(
          'transition-transform',
          size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
        )} />
      </Button>
      <p className="text-sm text-muted-foreground">
        Click or press <b>Space</b> to hear the word
      </p>
    </div>
  );
};

export default AudioPlayButton;