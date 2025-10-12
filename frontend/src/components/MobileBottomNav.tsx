import { Home, MessageSquare, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: MessageSquare, label: 'Chatbot', path: '/chatbot' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border mobile-nav-height"
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'p-2 rounded-xl smooth-transition',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground group-hover:text-foreground group-hover:bg-accent/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    'text-xs font-medium smooth-transition',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </motion.div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;
