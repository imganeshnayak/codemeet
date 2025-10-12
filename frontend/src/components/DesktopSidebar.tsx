import { Home, MessageSquare, Users, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: MessageSquare, label: 'Chatbot', path: '/chatbot' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const DesktopSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="hidden md:flex fixed left-0 top-0 bottom-0 sidebar-width bg-card border-r border-border flex-col z-40"
    >
      {/* Logo / Branding */}
      <div className="p-6 border-b border-border">
        <Link to="/home" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-transparent flex items-center justify-center">
            <img src="/awaaz logo .png" alt="Jan Awaaz logo" className="w-10 h-10 object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Jan Awaaz</h2>
            <p className="text-xs text-muted-foreground">City Services</p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path} className="block relative">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg smooth-transition relative overflow-hidden',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {/* Active indicator (left border) */}
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full ring-2 ring-border"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </motion.aside>
  );
};

export default DesktopSidebar;
