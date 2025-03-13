import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  List, 
  Upload, 
  GraduationCap, 
  AlertTriangle, 
  Volume2 
} from 'lucide-react';

const SideNav: React.FC = () => {
  const authContext = useContext(AuthContext);
  const location = useLocation();

  if (!authContext?.currentUser) return null;
  const { currentUser } = authContext;

  const navItems = [
    {
      name: 'Word Lists',
      path: '/word-lists',
      icon: <List className="h-5 w-5 mr-2" />
    },
    {
      name: 'Upload List',
      path: '/upload',
      icon: <Upload className="h-5 w-5 mr-2" />
    },
    {
      name: 'Review',
      path: '/review',
      icon: <GraduationCap className="h-5 w-5 mr-2" />
    },
    {
      name: 'Mistake Patterns',
      path: '/mistake-patterns',
      icon: <AlertTriangle className="h-5 w-5 mr-2" />
    },
    {
      name: 'Generate Audio',
      path: '/audio-generation',
      icon: <Volume2 className="h-5 w-5 mr-2" />
    }
  ];

  return (
    <nav className="hidden md:block w-64 min-h-screen border-r bg-card px-3 py-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center rounded-md py-2 px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SideNav;