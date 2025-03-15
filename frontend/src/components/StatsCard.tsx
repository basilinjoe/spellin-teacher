import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  // Convert numeric value to determine styling
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isPercentage = typeof value === 'string' && value.includes('%');
  
  // Dynamic color based on value type and range
  const getValueColor = () => {
    if (isPercentage) {
      const percent = parseFloat(value as string);
      if (percent >= 80) return 'text-green-600 dark:text-green-400';
      if (percent >= 60) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
    return '';
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className={cn(
        "hover:border-primary/50 transition-all duration-300 hover:shadow-md", 
        className
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "text-4xl font-bold tracking-tight",
                getValueColor(),
                valueClassName
              )}
            >
              {value}
            </motion.div>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-sm font-medium text-muted-foreground"
            >
              {label}
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;