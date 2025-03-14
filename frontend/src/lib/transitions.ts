import { Variants } from 'framer-motion';

// Map of page depths to determine transition direction
const pageDepths: { [key: string]: number } = {
  '/': 0,
  '/home': 0,
  '/login': 0,
  '/register': 0,
  '/word-lists': 1,
  '/practice': 2,
  '/progress': 2,
  '/mistake-patterns': 1,
};

export const getTransitionDirection = (
  currentPath: string, 
  previousPath: string | null
): 'forward' | 'backward' => {
  if (!previousPath) return 'forward';

  // Get base paths without params
  const currentBase = '/' + currentPath.split('/')[1];
  const previousBase = '/' + previousPath.split('/')[1];

  const currentDepth = pageDepths[currentBase] || 0;
  const previousDepth = pageDepths[previousBase] || 0;

  return currentDepth > previousDepth ? 'forward' : 'backward';
};

export const slideTransition: { [key: string]: Variants } = {
  forward: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  backward: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
};

export const fadeTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};