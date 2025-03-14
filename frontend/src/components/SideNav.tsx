import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { 
  List, 
  GraduationCap, 
  AlertTriangle, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

const SideNav: React.FC = () => {
  const authContext = useContext(AuthContext);
  const location = useLocation();
  const { collapsed, toggleSidebar } = useSidebar();

  if (!authContext?.currentUser) return null;

  const navItems = [
    {
      name: 'Word Lists',
      path: '/word-lists',
      icon: <List className="h-5 w-5" />
    },
    {
      name: 'Review',
      path: '/review',
      icon: <GraduationCap className="h-5 w-5" />
    },
    {
      name: 'Mistake Patterns',
      path: '/mistake-patterns',
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ];

  return (
    <nav 
      className={cn(
        "hidden md:flex flex-col min-h-screen border-r bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-16 px-2 py-4" : "w-64 px-3 py-4"
      )}
    >
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center rounded-md py-2 transition-colors hover:bg-accent hover:text-accent-foreground",
              collapsed ? "justify-center px-2" : "px-3",
              location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
            title={collapsed ? item.name : undefined}
          >
            <div className={collapsed ? "" : "mr-2"}>{item.icon}</div>
            {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SideNav;