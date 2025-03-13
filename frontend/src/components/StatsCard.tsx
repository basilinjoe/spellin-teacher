import React from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';

interface StatsCardProps {
  value: string | number;
  label: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ value, label, className = '' }) => {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="text-4xl font-bold text-primary">{value}</div>
        <p className="text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;