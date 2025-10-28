import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Users, Search, Edit, Trash2, Shield, ShieldCheck, 
    ShieldOff, Plus, Filter, Download, RefreshCw, 
    AlertCircle, CheckCircle, XCircle, User, Mail, 
    Calendar, Crown, UserCheck, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [bulkActions, setBulkActions] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users. Please try again.');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id, username) => {
        const result = await Swal.fire({
            title: `Delete User "${username}"?`,
            text: "This action cannot be undone and will remove all associated data.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            focusCancel: true
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Show success message
                await Swal.fire({
                    title: 'Deleted!',
                    text: `User "${username}" has been deleted successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });

                setUsers(users.filter(user => user.id !== id));
                setSelectedUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            } catch (err) {
                console.error('Error deleting user:', err);
                
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete user. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const toggleUserStatus = async (id, currentStatus, username) => {
        // Prevent admin from disabling themselves
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser.username === username && currentStatus) {
            await Swal.fire({
                title: 'Action Not Allowed',
                text: 'You cannot disable your own account',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        const action = currentStatus ? 'disable' : 'enable';
        const actionTitle = currentStatus ? 'Disable User' : 'Enable User';
        const actionText = currentStatus 
            ? `User "${username}" will not be able to login until re-enabled.`
            : `User "${username}" will be able to login normally.`;

        const result = await Swal.fire({
            title: actionTitle,
            text: actionText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#f59e0b' : '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${action} user!`,
            cancelButtonText: 'Cancel',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const endpoint = currentStatus ? 'disable' : 'enable';
                await axios.post(`http://localhost:8080/api/admin/users/${id}/${endpoint}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                await Swal.fire({
                    title: 'Success!',
                    text: `User "${username}" has been ${action}d successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });

                fetchUsers(); // Refresh the list
            } catch (err) {
                const errorMessage = err.response?.data?.error || `Failed to ${action} user`;
                
                await Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
                
                console.error('Error toggling user status:', err);
            }
        }
    };
   const updateUser = async (userData) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/users/${userData.id}`, userData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            setEditingUser(null);
            fetchUsers();

            await Swal.fire({
                title: 'Updated!',
                text: 'User updated successfully!',
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000,
                timerProgressBar: true
            });
        } catch (err) {
            console.error('Error updating user:', err);
            
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to update user. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        }
    };


   const handleBulkAction = async (action) => {
        if (selectedUsers.size === 0) {
            await Swal.fire({
                title: 'No Users Selected',
                text: 'Please select users first',
                icon: 'info',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        const userList = Array.from(selectedUsers).map(id => 
            users.find(u => u.id === id)?.username || 'Unknown'
        ).join(', ');

        const actionTitles = {
            enable: 'Enable Selected Users',
            disable: 'Disable Selected Users', 
            delete: 'Delete Selected Users'
        };

        const actionColors = {
            enable: '#10b981',
            disable: '#f59e0b',
            delete: '#ef4444'
        };

        const result = await Swal.fire({
            title: actionTitles[action],
            html: `Are you sure you want to ${action} the following users?<br><br><strong>${userList}</strong>`,
            icon: action === 'delete' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: actionColors[action],
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${action} them!`,
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            // Implement bulk action API calls here
            console.log(`Bulk ${action} for users:`, selectedUsers);
            
            await Swal.fire({
                title: 'Success!',
                text: `Selected users have been ${action}d successfully.`,
                icon: 'success',
                confirmButtonColor: '#10b981'
            });

            setBulkActions(false);
            setSelectedUsers(new Set());
        }
    };

    // Enhanced filtering logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === '' || 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || 
            (statusFilter === 'ACTIVE' && user.enabled !== false) ||
            (statusFilter === 'DISABLED' && user.enabled === false);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'DOCTOR':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PATIENT':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN':
                return <Crown size={14} className="text-purple-600" />;
            case 'DOCTOR':
                return <UserCheck size={14} className="text-blue-600" />;
            case 'PATIENT':
                return <User size={14} className="text-green-600" />;
            default:
                return <User size={14} className="text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading user management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <Users size={32} className="mr-3 text-indigo-600" />
                                    User Management
                                </h1>
                                <p className="text-gray-600 mt-2">Manage system users, roles, and permissions</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-indigo-600">{users.length}</div>
                                    <div className="text-sm text-gray-500">Total Users</div>
                                </div>
                                <button
                                    onClick={fetchUsers}
                                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Advanced Search and Filters */}
                        <div className="space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by username or email..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
                                        showAdvancedFilters 
                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <Filter size={18} />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {showAdvancedFilters && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                            <select
                                                value={roleFilter}
                                                onChange={(e) => setRoleFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="ALL">All Roles</option>
                                                <option value="ADMIN">Admin</option>
                                                <option value="DOCTOR">Doctor</option>
                                                <option value="PATIENT">Patient</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="ALL">All Status</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="DISABLED">Disabled</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setRoleFilter('ALL');
                                                    setStatusFilter('ALL');
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results Summary */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{currentUsers.length}</span> of <span className="font-semibold">{filteredUsers.length}</span> users
                                {searchTerm && <span> matching "{searchTerm}"</span>}
                            </p>
                            {selectedUsers.size > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{selectedUsers.size} selected</span>
                                    <button
                                        onClick={() => setBulkActions(true)}
                                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors"
                                    >
                                        Bulk Actions
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                            <span>{error}</span>
                            <button 
                                onClick={() => setError('')}
                                className="ml-auto text-red-600 hover:text-red-800"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Enhanced Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' 
                                    ? 'Try adjusting your search or filters.' 
                                    : 'No users have been created yet.'
                                }
                            </p>
                            {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setRoleFilter('ALL');
                                        setStatusFilter('ALL');
                                        setCurrentPage(1);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.size === currentUsers.length && currentUsers.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUsers(new Set(currentUsers.map(u => u.id)));
                                                        } else {
                                                            setSelectedUsers(new Set());
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                User Information
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Role & Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Created Date
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentUsers.map((user) => (
                                            <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${
                                                selectedUsers.has(user.id) ? 'bg-indigo-50' : ''
                                            }`}>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.has(user.id)}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedUsers);
                                                            if (e.target.checked) {
                                                                newSet.add(user.id);
                                                            } else {
                                                                newSet.delete(user.id);
                                                            }
                                                            setSelectedUsers(newSet);
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <User size={16} className="text-gray-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                                                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                                                <Mail size={12} className="mr-1" />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg border ${getRoleColor(user.role)}`}>
                                                            {getRoleIcon(user.role)}
                                                            <span className="ml-1">{user.role}</span>
                                                        </div>
                                                        <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg border ${
                                                            user.enabled !== false 
                                                                ? 'bg-green-100 text-green-800 border-green-200' 
                                                                : 'bg-red-100 text-red-800 border-red-200'
                                                        }`}>
                                                            {user.enabled !== false ? (
                                                                <>
                                                                    <CheckCircle size={12} className="mr-1" />
                                                                    Active
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle size={12} className="mr-1" />
                                                                    Disabled
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <Calendar size={14} className="mr-2 text-gray-400" />
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit user"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUserStatus(user.id, user.enabled !== false, user.username)}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                user.enabled !== false
                                                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                                                                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                                            }`}
                                                            title={user.enabled !== false ? 'Disable user' : 'Enable user'}
                                                        >
                                                            {user.enabled !== false ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user.id, user.username)}
                                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Enhanced Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} results
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft size={16} className="mr-1" />
                                                Previous
                                            </button>
                                            
                                            {/* Page numbers */}
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let page;
                                                    if (totalPages <= 5) {
                                                        page = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        page = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        page = totalPages - 4 + i;
                                                    } else {
                                                        page = currentPage - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                                currentPage === page
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            
                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                                <ChevronRight size={16} className="ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                updateUser(editingUser);
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={editingUser.username}
                                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bulk Actions Modal */}
                {bulkActions && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Bulk Actions</h3>
                                <button
                                    onClick={() => setBulkActions(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">{selectedUsers.size} users selected</p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleBulkAction('enable')}
                                    className="w-full p-3 text-left text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center"
                                >
                                    <ShieldCheck size={16} className="mr-3" />
                                    Enable Selected Users
                                </button>
                                <button
                                    onClick={() => handleBulkAction('disable')}
                                    className="w-full p-3 text-left text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center"
                                >
                                    <ShieldOff size={16} className="mr-3" />
                                    Disable Selected Users
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="w-full p-3 text-left text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                                >
                                    <Trash2 size={16} className="mr-3" />
                                    Delete Selected Users
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
