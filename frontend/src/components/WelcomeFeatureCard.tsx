import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WelcomeFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

const WelcomeFeatureCard: React.FC<WelcomeFeatureCardProps> = ({
  icon,
  title,
  description,
  className = ''
}) => {
  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
        <div className="rounded-full bg-primary/10 p-4">
          <i className={cn(icon, 'text-3xl text-primary')} />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default WelcomeFeatureCard;