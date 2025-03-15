import React from 'react';
import { motion } from 'framer-motion';
import { usePage } from '@/contexts/PageProvider';

export const LoadingBar: React.FC = () => {
  const { isTransitioning } = usePage();

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-[100] overflow-hidden">
      {isTransitioning && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary to-primary/50"
        >
          <motion.div
            animate={{ 
              scaleX: [1, 0.7, 1],
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
        </motion.div>
      )}
    </div>
  );
};