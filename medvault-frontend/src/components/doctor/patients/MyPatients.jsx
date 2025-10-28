import React, { useState, useEffect } from 'react';
import { 
    UsersIcon, 
    Loader2, 
    User, 
    Mail, 
    Phone, 
    Search, 
    Filter,
    Calendar,
    MapPin,
    Heart,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    Clock
} from 'lucide-react';

const MyPatients = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('ALL');
    const [ageFilter, setAgeFilter] = useState('ALL');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) return;
                
                const response = await fetch(`http://localhost:8080/api/doctor/my-patients/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPatients(data);
                    setFilteredPatients(data);
                }
            } catch (error) {
                console.error("Failed to fetch patients:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // Filter patients based on search term, gender, and age
    useEffect(() => {
        let filtered = [...patients];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(patient => {
                const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
                const email = patient.email.toLowerCase();
                const phone = patient.contactNumber || '';
                return fullName.includes(searchTerm.toLowerCase()) || 
                       email.includes(searchTerm.toLowerCase()) ||
                       phone.includes(searchTerm);
            });
        }

        // Gender filter
        if (genderFilter !== 'ALL') {
            filtered = filtered.filter(patient => 
                patient.gender && patient.gender.toUpperCase() === genderFilter
            );
        }

        // Age filter
        if (ageFilter !== 'ALL') {
            filtered = filtered.filter(patient => {
                const age = calculateAge(patient.dateOfBirth);
                if (age === 'N/A') return false;
                
                switch (ageFilter) {
                    case 'CHILD':
                        return age < 18;
                    case 'ADULT':
                        return age >= 18 && age < 65;
                    case 'SENIOR':
                        return age >= 65;
                    default:
                        return true;
                }
            });
        }

        setFilteredPatients(filtered);
        setCurrentPage(1);
    }, [patients, searchTerm, genderFilter, ageFilter]);

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Pagination calculations
    const totalItems = filteredPatients.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination component
    const Pagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">{indexOfFirstItem + 1}</span>
                            {' '}to{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastItem, totalItems)}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium">{totalItems}</span>
                            {' '}patients
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value={12}>12 per page</option>
                            <option value={24}>24 per page</option>
                            <option value={36}>36 per page</option>
                            <option value={48}>48 per page</option>
                        </select>
                        
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            {startPage > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        1
                                    </button>
                                    {startPage > 2 && (
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                            ...
                                        </span>
                                    )}
                                </>
                            )}
                            
                            {pageNumbers.map((number) => (
                                <button
                                    key={number}
                                    onClick={() => setCurrentPage(number)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${
                                        currentPage === number
                                            ? 'z-10 bg-emerald-600 text-white'
                                            : 'text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {number}
                                </button>
                            ))}
                            
                            {endPage < totalPages && (
                                <>
                                    {endPage < totalPages - 1 && (
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                            ...
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                            
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    const PatientCard = ({ patient }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
            <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    {patient.firstName.charAt(0)}{patient.lastName ? patient.lastName.charAt(0) : ''}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <UserCheck size={12} className="mr-1" />
                            Active Patient
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-3">
                        ID: P{patient.userId}
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                            <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{patient.email}</span>
                        </div>
                        
                        {patient.contactNumber && (
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                                <span>{patient.contactNumber}</span>
                            </div>
                        )}
                        
                        {patient.dateOfBirth && (
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                                <span>{formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years)</span>
                            </div>
                        )}
                        
                        {patient.gender && (
                            <div className="flex items-center text-sm text-gray-600">
                                <User size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                                <span className="capitalize">{patient.gender.toLowerCase()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <UsersIcon size={32} className="mr-3 text-emerald-600" />
                                My Patients
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Manage and view all patients under your care
                            </p>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">
                                {patients.length}
                            </div>
                            <div className="text-sm text-gray-500">
                                Total Patients
                            </div>
                        </div>
                    </div>
                </div>

                {patients.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UsersIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patients Found</h3>
                        <p className="text-gray-500 mb-6">
                            Patients will appear here after their first approved appointment with you.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                            <h4 className="font-medium text-blue-900 mb-2">Getting Started:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Complete your profile verification</li>
                                <li>• Set up your availability</li>
                                <li>• Approve patient appointments</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Filters and Search */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or phone..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Gender Filter */}
                                <select
                                    value={genderFilter}
                                    onChange={(e) => setGenderFilter(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="ALL">All Genders</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>

                                {/* Age Filter */}
                                <select
                                    value={ageFilter}
                                    onChange={(e) => setAgeFilter(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="ALL">All Ages</option>
                                    <option value="CHILD">Under 18</option>
                                    <option value="ADULT">18-64 years</option>
                                    <option value="SENIOR">65+ years</option>
                                </select>
                            </div>

                            {/* Results count */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                                <p>
                                    Showing <span className="font-semibold">{currentItems.length}</span> of <span className="font-semibold">{filteredPatients.length}</span> patients
                                    {patients.length !== filteredPatients.length && (
                                        <span> (filtered from {patients.length} total)</span>
                                    )}
                                </p>
                                {(searchTerm || genderFilter !== 'ALL' || ageFilter !== 'ALL') && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setGenderFilter('ALL');
                                            setAgeFilter('ALL');
                                        }}
                                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Patients Grid */}
                        {filteredPatients.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Patients</h3>
                                <p className="text-gray-500 mb-4">
                                    Try adjusting your search or filter criteria
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setGenderFilter('ALL');
                                        setAgeFilter('ALL');
                                    }}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    Show all patients
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                                    {currentItems.map((patient) => (
                                        <PatientCard key={patient.id} patient={patient} />
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                <Pagination />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyPatients;
