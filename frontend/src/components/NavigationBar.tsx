import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, List, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const NavigationBar: React.FC = () => {
  const context = useContext(AuthContext);
  const currentUser = context?.currentUser;
  const logout = context?.logout ?? (() => {});
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isScrolled, scrollDirection } = useScrollAnimation(20);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      name: 'Word Lists',
      path: '/word-lists',
      icon: <List className="h-4 w-4" />
    },
    {
      name: 'Mistake Patterns',
      path: '/mistake-patterns',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  const getInitials = (email: string): string => {
    return email
      ? email.split('@')[0].substring(0, 2).toUpperCase()
      : 'ST';
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ 
        y: scrollDirection === 'down' ? -100 : 0,
        height: isScrolled ? '3rem' : '3.5rem'
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        height: {
          duration: 0.2
        }
      }}
      className={cn(
        "sticky top-0 z-40 w-full border-b backdrop-blur",
        "transition-[background-color,border-color]",
        isScrolled 
          ? "bg-background/95 supports-[backdrop-filter]:bg-background/60 border-muted" 
          : "bg-background border-transparent"
      )}
    >
      <div className={cn(
        "container flex items-center px-4 h-full",
        "transition-all duration-200"
      )}>
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-transform hover:scale-105 mr-8"
        >
          <i className="fas fa-spell-check text-primary text-xl"></i>
          <span className="hidden sm:inline-block font-bold">
            Spelling Teacher
          </span>
        </Link>

        {currentUser && (
          <nav className="hidden md:flex flex-1">
            <motion.ul 
              className="flex items-center gap-4 text-sm"
              initial={false}
            >
              {navItems.map((item) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      location.pathname === item.path && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <AnimatePresence mode="wait">
            {currentUser ? (
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="hidden md:flex md:items-center md:gap-2">
                  <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {getInitials(currentUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden md:inline-block">{currentUser.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="hidden md:flex transition-all"
                  size="sm"
                >
                  Logout
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Button variant="ghost" asChild size="sm" className="transition-transform hover:scale-105">
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild size="sm" className="transition-transform hover:scale-105">
                  <Link to="/register">Register</Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default NavigationBar;