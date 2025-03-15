import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, List, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';

const NavigationBar: React.FC = () => {
  const context = useContext(AuthContext);
  const currentUser = context?.currentUser;
  const logout = context?.logout ?? (() => {});
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b backdrop-blur bg-background",
        "transition-[background-color,border-color]",
      )}
    >
      <div className="container flex items-center px-4 h-14">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-transform hover:scale-105 mr-8"
        >
          <i className="fas fa-spell-check text-primary text-xl"></i>
          <span className="hidden sm:inline-block font-bold">
          SpellWise
          </span>
        </Link>

        {currentUser && (
          <nav className="hidden md:flex flex-1">
            <ul className="flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <li key={item.path}>
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
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <AnimatePresence mode="wait">
            {currentUser ? (
              <div className="flex items-center gap-4">
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
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm" className="transition-transform hover:scale-105">
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild size="sm" className="transition-transform hover:scale-105">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;