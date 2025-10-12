import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  reportsSubmitted?: number;
  votesCast?: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data.data.users || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user: User) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await axios.patch(`/api/admin/users/${user._id}`, { role: newRole });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const toggleActive = async (user: User) => {
    try {
      await axios.patch(`/api/admin/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`Delete user ${user.email}?`)) return;
    try {
      await axios.delete(`/api/admin/users/${user._id}`);
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      {loading ? <div>Loading...</div> : (
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Reports</th>
              <th className="px-4 py-2">Votes</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{u.isActive ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">{u.reportsSubmitted ?? 0}</td>
                <td className="px-4 py-2">{u.votesCast ?? 0}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => toggleRole(u)} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Toggle Role</button>
                  <button onClick={() => toggleActive(u)} className="px-2 py-1 bg-yellow-600 text-white rounded text-sm">Toggle Active</button>
                  <button onClick={() => deleteUser(u)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;
