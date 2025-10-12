import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileBottomNav from './MobileBottomNav';
import DesktopSidebar from './DesktopSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main className="min-h-screen md:pl-[16rem] pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            key={location.pathname}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default AppLayout;
