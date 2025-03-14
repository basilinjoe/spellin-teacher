import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  value: string | number;
  label: string;
  className?: string;
  valueClassName?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  value, 
  label, 
  className = '',
  valueClassName = '' 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className={cn(
            "text-3xl font-bold tracking-tight",
            valueClassName
          )}>
            {value}
          </div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;