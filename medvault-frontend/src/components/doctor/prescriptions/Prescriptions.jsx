// src/components/doctor/prescriptions/Prescriptions.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Pill, 
  Clock,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showNewPrescription, setShowNewPrescription] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        throw new Error("User not found");
      }

      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:8080/api/doctor/prescriptions/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(Array.isArray(data) ? data : []);
      } else if (response.status === 404) {
        setPrescriptions([]); // No prescriptions found
      } else {
        throw new Error(`Failed to fetch prescriptions: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.message || 'Failed to load prescriptions');
      setPrescriptions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter prescriptions based on search and status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = searchTerm === '' || 
      prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications?.some(med => 
        med.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = filterStatus === 'ALL' || prescription.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-center">
            <FileText className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Error Loading Prescriptions</h3>
              <p>{error}</p>
              <button 
                onClick={fetchPrescriptions}
                className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText size={32} className="mr-3 text-blue-600" />
              Prescriptions
            </h1>
            <p className="text-gray-600 mt-2">Manage and track patient prescriptions</p>
          </div>
          <button 
            onClick={() => setShowNewPrescription(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center shadow-sm transition-all duration-200"
          >
            <Plus size={18} className="mr-2" />
            New Prescription
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name or medication..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing <span className="font-semibold">{filteredPrescriptions.length}</span> of <span className="font-semibold">{prescriptions.length}</span> prescriptions
            </p>
            {(searchTerm || filterStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {prescriptions.length === 0 ? 'No Prescriptions Yet' : 'No Matching Prescriptions'}
            </h3>
            <p className="text-gray-600 mb-6">
              {prescriptions.length === 0 
                ? 'Start by creating your first prescription for a patient.' 
                : 'Try adjusting your search or filters to see more results.'
              }
            </p>
            {prescriptions.length === 0 ? (
              <button 
                onClick={() => setShowNewPrescription(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create First Prescription
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Show all prescriptions
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <PrescriptionCard 
                  key={prescription.id} 
                  prescription={prescription}
                  onView={() => console.log('View prescription:', prescription.id)}
                  onEdit={() => console.log('Edit prescription:', prescription.id)}
                  onDelete={() => console.log('Delete prescription:', prescription.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* New Prescription Modal/Form would go here */}
        {showNewPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">New Prescription</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600">Prescription form would be implemented here...</p>
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowNewPrescription(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Prescription Card Component
const PrescriptionCard = ({ prescription, onView, onEdit, onDelete }) => {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Patient Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {prescription.patientName || `Patient ID: ${prescription.patientId}`}
              </p>
              <p className="text-sm text-gray-600">
                Prescribed on {formatDate(prescription.createdAt || prescription.date)}
              </p>
            </div>
          </div>
          
          {/* Medications */}
          <div className="ml-13">
            <div className="flex items-center space-x-2 mb-2">
              <Pill size={14} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Medications:</span>
            </div>
            <div className="space-y-1">
              {prescription.medications && prescription.medications.length > 0 ? (
                prescription.medications.slice(0, 3).map((med, index) => (
                  <div key={index} className="text-sm text-gray-600 ml-4">
                    • <span className="font-medium">{med.name}</span> - {med.dosage} ({med.frequency})
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 ml-4">No medications listed</div>
              )}
              {prescription.medications && prescription.medications.length > 3 && (
                <div className="text-sm text-blue-600 ml-4">
                  +{prescription.medications.length - 3} more medications
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center space-x-4">
          {/* Status */}
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(prescription.status || 'ACTIVE')}`}>
            {prescription.status || 'ACTIVE'}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={onView}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View prescription"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit prescription"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete prescription"
            >
              <Trash2 size={16} />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Download prescription"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status color (moved outside component to avoid recreation)
const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default Prescriptions;
