import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components';
import { cn } from '@/lib/utils';
import { usePage } from '@/contexts/PageProvider';
import { getTransitionDirection, slideTransition } from '@/lib/transitions';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children,
  className = ''
}) => {
  const { isTransitioning, previousPath } = usePage();
  const location = useLocation();
  const direction = getTransitionDirection(location.pathname, previousPath);
  const variants = slideTransition[direction];

  return (
    <div className="relative">
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <LoadingSpinner size="lg" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ 
          type: 'spring',
          stiffness: 380,
          damping: 30
        }}
        className={cn('relative', className)}
      >
        {children}
      </motion.div>
    </div>  
  );
};