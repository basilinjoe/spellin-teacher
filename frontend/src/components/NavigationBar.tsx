import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

const NavigationBar: React.FC = () => {
  const context = useContext(AuthContext);
  const currentUser = context?.currentUser;
  const logout = context?.logout ?? (() => {});
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  // Get initials for avatar
  const getInitials = (email: string): string => {
    return email
      ? email
          .split('@')[0]
          .substring(0, 2)
          .toUpperCase()
      : 'ST';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        {/* Brand/Logo */}
        <div className="flex gap-2 mr-4 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fas fa-spell-check text-primary"></i>
            <span className="hidden sm:inline-block font-bold">
              Spelling Teacher
            </span>
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="flex flex-1 items-center justify-end space-x-2 md:justify-end">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex md:items-center md:gap-2">
                <Avatar>
                  <AvatarFallback>{getInitials(currentUser.email)}</AvatarFallback>
                </Avatar>
                <span className="text-sm hidden md:inline-block">{currentUser.email}</span>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="hidden md:flex"
              >
                Logout
              </Button>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="pt-10">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>{getInitials(currentUser.email)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setIsSheetOpen(false);
                      }}
                      className="justify-start px-2"
                    >
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;