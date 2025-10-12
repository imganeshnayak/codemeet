import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 shadow rounded">Total issues: (placeholder)</div>
        <div className="p-4 bg-white dark:bg-gray-800 shadow rounded">Active users: (placeholder)</div>
        <div className="p-4 bg-white dark:bg-gray-800 shadow rounded">Top reporters: (placeholder)</div>
      </div>
    </div>
  );
};

export default Dashboard;
