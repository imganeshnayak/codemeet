import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <nav className="space-x-4">
            <Link to="/admin" className="text-sm">Dashboard</Link>
            <Link to="/admin/users" className="text-sm">Users</Link>
            <Link to="/admin/issues" className="text-sm">Issues</Link>
          </nav>
        </div>
      </header>
      <main className="p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
