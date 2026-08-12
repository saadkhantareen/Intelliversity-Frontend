import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { ProfileService } from '../../services/profile.service';
import SectionCard from '../../components/ui/SectionCard';
import toast from 'react-hot-toast';

function UsersPage() {
  const { config } = useTenant();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.base_profile?.roles?.includes(roleFilter));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.base_profile?.first_name?.toLowerCase().includes(q) ||
          u.base_profile?.last_name?.toLowerCase().includes(q) ||
          u.base_profile?.email?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const res = await ProfileService.getAllUsers();
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-sm text-gray-400">{filtered.length} users found</p>
      </div>

      {/* Search + Filter */}
      <SectionCard>
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </SectionCard>

      {/* Users Table */}
      <SectionCard>
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">CNIC</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, index) => {
                const bp = user.base_profile;
                const role = bp?.roles?.[0];
                return (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {bp?.profile_picture ? (
                          <img
                            src={bp.profile_picture}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            style={{ backgroundColor: config?.color }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          >
                            {bp?.first_name?.[0]}
                            {bp?.last_name?.[0]}
                          </div>
                        )}
                        <span className="font-medium text-gray-700">
                          {bp?.first_name} {bp?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{bp?.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        style={{ backgroundColor: config?.color }}
                        className="text-white px-2 py-0.5 rounded-full text-xs"
                      >
                        {role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{bp?.cnic || '—'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/users/${bp?.user}`)}
                        style={{ color: config?.color }}
                        className="text-xs font-medium hover:underline"
                      >
                        View & Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}

export default UsersPage;
