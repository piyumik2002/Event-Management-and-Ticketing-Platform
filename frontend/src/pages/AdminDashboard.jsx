import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search and Filter for States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = userData?.token || localStorage.getItem('token'); 

        if (!token) {
          setErrorMsg("Unauthorized! No token found. Please log in again.");
          setLoading(false);
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const res = await axios.get('http://localhost:5000/api/admin/users', config);
        setUsers(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMsg("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); 

  // Organizer Approve function
  const handleApprove = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?.token || localStorage.getItem('token'); 

      await axios.put(`http://localhost:5000/api/admin/approve-organizer/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      window.location.reload(); 
    } catch (error) {
      console.error("Approve error:", error);
      alert("Error approving organizer");
    }
  };

  // User or Organizer Delete function
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = userData?.token || localStorage.getItem('token');

        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert("User deleted successfully!");
        window.location.reload(); 
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  // createDocument URL 
  const getDocUrl = (docPath) => {
    if (!docPath) return '#';
    if (docPath.startsWith('http://') || docPath.startsWith('https://')) {
      return docPath;
    }
    return `http://localhost:5000/${docPath}`;
  };

  // [NEW ANALYTICS LOGIC] - Calculating statistics from the entire data set
  const totalUsers = users.length;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalOrganizers = users.filter(u => u.role === 'organizer').length;
  const pendingOrganizers = users.filter(u => u.role === 'organizer' && !u.isApproved).length;

  // Search and Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'approved' && user.isApproved) || 
      (selectedStatus === 'pending' && !user.isApproved);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage event organizers and system users.</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            System Admin Active
          </span>
        </div>

        {/* Analytics Cards Section */}
        {!loading && !errorMsg && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            
            {/* Card 1: Total Users */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md transition-all duration-200 hover:border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{totalUsers}</span>
                <span className="text-xs text-slate-500">Registered</span>
              </div>
            </div>

            {/* Card 2: Total Customers */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md transition-all duration-200 hover:border-slate-700">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Total Customers</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{totalCustomers}</span>
                <span className="text-xs text-slate-500">Users</span>
              </div>
            </div>

            {/* Card 3: Total Organizers */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md transition-all duration-200 hover:border-slate-700">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Total Organizers</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{totalOrganizers}</span>
                <span className="text-xs text-slate-500">Managers</span>
              </div>
            </div>

            {/* Card 4: Pending Approvals */}
            <div className="bg-slate-900 border border-amber-500/20 p-5 rounded-xl shadow-md transition-all duration-200 hover:border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-500/5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Approvals</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-amber-400">{pendingOrganizers}</span>
                <span className="text-xs text-amber-500/80 font-medium">Action Required</span>
              </div>
            </div>

          </div>
        )}

        {/* Search and Filter Bar Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          {/* server input box */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">Search User</label>
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Role Filter Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        {/* Error Handle */}
        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 text-center">
            {errorMsg}
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-emerald-400 animate-pulse font-medium text-lg">Loading system users...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-300 font-semibold text-sm">
                    <th className="p-4 w-[22%]">Full Name</th>
                    <th className="p-4 w-[25%]">Email Address</th>
                    <th className="p-4 w-[13%]">Role</th>
                    <th className="p-4 w-[18%]">Verification Status</th>
                    <th className="p-4 text-left w-[22%] pl-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                        No users match the search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-medium text-white truncate">{user.name}</td>
                        <td className="p-4 text-slate-400 truncate">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-medium capitalize block w-max ${
                            user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            user.role === 'organizer' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.isApproved 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isApproved ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                            {user.isApproved ? "Approved" : "Pending Approval"}
                          </span>
                        </td>
                        
                        {/* Actions Column */}
                        <td className="p-4 pl-8">
                          <div className="grid grid-cols-3 gap-2 items-center w-full max-w-[240px]">
                            
                            {/* 1 වන තීරුව: View Doc බටන් එක */}
                            <div className="flex justify-start">
                              {user.role === 'organizer' && user.verificationDoc ? (
                                <a 
                                  href={getDocUrl(user.verificationDoc)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="whitespace-nowrap bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 border border-blue-500/20 font-semibold px-2 py-1 rounded-md text-xs transition-all duration-200"
                                >
                                  View Doc
                                </a>
                              ) : (
                                <div className="h-4"></div>
                              )}
                            </div>

                            {/*  Approve button */}
                            <div className="flex justify-start">
                              {user.role === 'organizer' && !user.isApproved ? (
                                <button 
                                  onClick={() => handleApprove(user._id)} 
                                  className="whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-2 py-1 rounded-md text-xs shadow-md shadow-emerald-500/10 transition-colors"
                                >
                                  Approve
                                </button>
                              ) : (
                                <div className="h-4"></div>
                              )}
                            </div>
                            
                            {/* Delete button */}
                            <div className="flex justify-start">
                              {user.role !== 'admin' ? (
                                <button 
                                  onClick={() => handleDelete(user._id, user.name)} 
                                  className="whitespace-nowrap bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 font-semibold px-2 py-1 rounded-md text-xs transition-all duration-200"
                                >
                                  Delete
                                </button>
                              ) : (
                                <div className="h-4"></div>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;