import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    Award, 
    Clock, 
    DollarSign, 
    FileText, 
    Upload, 
    CheckCircle, 
    AlertCircle, 
    Plus,
    Loader2,
    Shield,
    Star,
    Stethoscope,
    GraduationCap,
    Building,
    Languages,
    Eye,
    Edit3,
    Save,
    X,
    AlertTriangle,
    BookOpen,
    Settings
} from 'lucide-react';

const DoctorProfile = () => {
    const [activeTab, setActiveTab] = useState('basic');
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        contactNumber: '',
        email: '',
        address: '',
        specialization: '',
        yearsOfExperience: '',
        consultationFees: '',
        languagesSpoken: ''
    });
    const [documents, setDocuments] = useState({
        medicalDegree: null,
        medicalLicense: '',
        governmentId: null,
        clinicAffiliation: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [doctorStatus, setDoctorStatus] = useState(null);
    const [doctorData, setDoctorData] = useState(null);
    const [profileExists, setProfileExists] = useState(false);
    const [documentsUploaded, setDocumentsUploaded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/profile/${user.id}`);

            if (response.ok) {
                const doctor = await response.json();

                if (doctor.id) {
                    setProfileData({
                        firstName: doctor.firstName || user.firstName || '',
                        lastName: doctor.lastName || user.lastName || '',
                        gender: doctor.gender || '',
                        dateOfBirth: doctor.dateOfBirth || '',
                        contactNumber: doctor.contactNumber || '',
                        email: doctor.email || user.email || '',
                        address: doctor.address || '',
                        specialization: doctor.specialization || '',
                        yearsOfExperience: doctor.yearsOfExperience || '',
                        consultationFees: doctor.consultationFees || '',
                        languagesSpoken: doctor.languagesSpoken || ''
                    });
                    setDoctorStatus(doctor.status);
                    setDoctorData(doctor);
                    setProfileExists(Boolean(doctor.profileComplete));
                    setDocumentsUploaded(Boolean(doctor.documentsUploaded));
                } else {
                    setProfileExists(false);
                    setDocumentsUploaded(false);
                    setDoctorStatus('INACTIVE');
                }

                if (!doctor.profileComplete) {
                    setActiveTab('basic');
                } else if (!doctor.documentsUploaded) {
                    setActiveTab('documents');
                }
            } else {
                setProfileExists(false);
                setActiveTab('basic');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfileExists(false);
            setActiveTab('basic');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setDocuments(prev => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const handleBasicInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:8080/api/doctor/profile/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            const result = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: result.message });
                setProfileExists(true);
                setIsEditing(false);
                setActiveTab('documents');
                fetchDoctorProfile();
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!documents.medicalDegree || !documents.medicalLicense || !documents.governmentId) {
            setMessage({ type: 'error', text: 'Please upload all required documents' });
            setLoading(false);
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const formData = new FormData();
            formData.append('medicalDegree', documents.medicalDegree);
            formData.append('medicalLicense', documents.medicalLicense);
            formData.append('governmentId', documents.governmentId);
            if (documents.clinicAffiliation) {
                formData.append('clinicAffiliation', documents.clinicAffiliation);
            }

            const response = await fetch(`http://localhost:8080/api/doctor/upload-documents/${user.id}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: result.message });
                setDoctorStatus('PENDING');
                setDocumentsUploaded(true);
                fetchDoctorProfile();
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error uploading documents' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: {
                bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
                border: 'border-amber-200',
                text: 'text-amber-800',
                icon: Clock,
                label: 'Verification Pending',
                description: 'Your documents are being reviewed'
            },
            APPROVED: {
                bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
                border: 'border-emerald-200',
                text: 'text-emerald-800',
                icon: CheckCircle,
                label: 'Verified Doctor',
                description: 'Your profile is approved and active'
            },
            REJECTED: {
                bg: 'bg-gradient-to-r from-red-50 to-rose-50',
                border: 'border-red-200',
                text: 'text-red-800',
                icon: AlertTriangle,
                label: 'Verification Failed',
                description: 'Please review and resubmit documents'
            }
        };
        return configs[status];
    };

    const ProfileHeader = () => {
        const statusConfig = getStatusConfig(doctorStatus);
        
        return (
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative px-8 py-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                                <User size={40} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    {profileData.firstName && profileData.lastName 
                                        ? `Dr. ${profileData.firstName} ${profileData.lastName}`
                                        : 'Complete Your Profile'
                                    }
                                </h1>
                                {profileData.specialization && (
                                    <p className="text-blue-100 text-lg mb-2">{profileData.specialization}</p>
                                )}
                                <p className="text-blue-200">
                                    {doctorStatus === 'APPROVED'
                                        ? 'Ready to accept appointments'
                                        : profileExists
                                        ? 'Profile setup in progress'
                                        : 'Set up your professional profile'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        {statusConfig && (
                            <div className={`mt-6 lg:mt-0 ${statusConfig.bg} ${statusConfig.border} border rounded-xl p-4 backdrop-blur-sm`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 ${statusConfig.text} rounded-lg flex items-center justify-center bg-white/20`}>
                                        <statusConfig.icon size={20} />
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${statusConfig.text}`}>{statusConfig.label}</p>
                                        <p className={`text-sm ${statusConfig.text} opacity-80`}>{statusConfig.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const NavigationTabs = () => {
        const tabs = [
            {
                id: 'basic',
                label: 'Basic Information',
                icon: User,
                enabled: true,
                completed: profileExists
            },
            
            {
                id: 'overview',
                label: 'Profile Overview',
                icon: Eye,
                enabled: profileExists && documentsUploaded,
                completed: doctorStatus === 'APPROVED'
            }
        ];

        return (
            <div className="bg-white border-b border-gray-200">
                <div className="px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isDisabled = !tab.enabled;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => tab.enabled && setActiveTab(tab.id)}
                                    disabled={isDisabled}
                                    className={`
                                        flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm
                                        ${isActive 
                                            ? 'border-blue-500 text-blue-600' 
                                            : isDisabled
                                            ? 'border-transparent text-gray-400 cursor-not-allowed'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                        transition-colors duration-200
                                    `}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                    {tab.completed && (
                                        <CheckCircle size={14} className="text-emerald-500" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        );
    };

    const BasicInformationForm = () => (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                    <p className="text-gray-600 mt-1">Tell us about your professional background</p>
                </div>
                {profileExists && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit3 size={16} />
                        <span>Edit Profile</span>
                    </button>
                )}
            </div>

            {profileExists && !isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Full Name', value: `${profileData.firstName} ${profileData.lastName}`, icon: User },
                        { label: 'Email', value: profileData.email, icon: Mail },
                        { label: 'Phone', value: profileData.contactNumber, icon: Phone },
                        { label: 'Gender', value: profileData.gender, icon: User },
                        { label: 'Specialization', value: profileData.specialization, icon: Stethoscope },
                        { label: 'Experience', value: `${profileData.yearsOfExperience} years`, icon: Award },
                        { label: 'Languages', value: profileData.languagesSpoken || 'Not specified', icon: Languages },
                        { label: 'Consultation Fee', value: profileData.consultationFees ? `₹${profileData.consultationFees}` : 'Not specified', icon: DollarSign },
                    ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Icon size={16} className="text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                </div>
                                <p className="text-gray-900 font-semibold">{item.value}</p>
                            </div>
                        );
                    })}
                    
                    
                </div>
            ) : (
                <form onSubmit={handleBasicInfoSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <User size={16} className="mr-2 text-gray-400" />
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter your first name"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter your last name"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <Mail size={16} className="mr-2 text-gray-400" />
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <Phone size={16} className="mr-2 text-gray-400" />
                                Contact Number *
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={profileData.contactNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="+91 98765 43210"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                Gender *
                            </label>
                            <select
                                name="gender"
                                value={profileData.gender}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <Calendar size={16} className="mr-2 text-gray-400" />
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={profileData.dateOfBirth}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <Stethoscope size={16} className="mr-2 text-gray-400" />
                                Medical Specialization *
                            </label>
                            <input
                                type="text"
                                name="specialization"
                                value={profileData.specialization}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="e.g., Cardiologist, Orthopedic Surgeon"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <Award size={16} className="mr-2 text-gray-400" />
                                Years of Experience *
                            </label>
                            <input
                                type="number"
                                name="yearsOfExperience"
                                value={profileData.yearsOfExperience}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="10"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <DollarSign size={16} className="mr-2 text-gray-400" />
                                Consultation Fee
                            </label>
                            <input
                                type="number"
                                name="consultationFees"
                                value={profileData.consultationFees}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="500"
                                min="0"
                            />
                            <p className="text-sm text-gray-500 mt-1">Leave empty if you prefer not to specify</p>
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                <Languages size={16} className="mr-2 text-gray-400" />
                                Languages Spoken
                            </label>
                            <input
                                type="text"
                                name="languagesSpoken"
                                value={profileData.languagesSpoken}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="English, Hindi, Telugu"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                            <MapPin size={16} className="mr-2 text-gray-400" />
                            Complete Address *
                        </label>
                        <textarea
                            name="address"
                            value={profileData.address}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Enter your complete address including city, state, and pincode"
                            required
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Save & Continue</span>
                                </>
                            )}
                        </button>
                        
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-semibold flex items-center space-x-2"
                            >
                                <X size={16} />
                                <span>Cancel</span>
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );

    const DocumentsForm = () => (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Document Verification</h2>
                <p className="text-gray-600 mt-1">Upload required documents to verify your medical credentials</p>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Verification Requirements</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• All documents must be clear, legible, and in PDF or image format</li>
                                <li>• File size should not exceed 5MB per document</li>
                                <li>• Documents will be verified by our medical team within 1-2 business days</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                            <GraduationCap size={16} className="mr-2 text-gray-400" />
                            Medical Degree Certificate *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                name="medicalDegree"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                id="medicalDegree"
                                required
                            />
                            <label htmlFor="medicalDegree" className="cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPEG, PNG (Max 5MB)</p>
                            </label>
                            {documents.medicalDegree && (
                                <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={16} className="text-green-600 mr-2" />
                                    <span className="text-sm text-green-700">{documents.medicalDegree.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                            <FileText size={16} className="mr-2 text-gray-400" />
                            Government ID Proof *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                name="governmentId"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                id="governmentId"
                                required
                            />
                            <label htmlFor="governmentId" className="cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Aadhar/Passport/Driving License</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPEG, PNG (Max 5MB)</p>
                            </label>
                            {documents.governmentId && (
                                <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={16} className="text-green-600 mr-2" />
                                    <span className="text-sm text-green-700">{documents.governmentId.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <BookOpen size={16} className="mr-2 text-gray-400" />
                        Medical Council Registration/License Number *
                    </label>
                    <input
                        type="text"
                        value={documents.medicalLicense}
                        onChange={(e) => setDocuments(prev => ({ ...prev, medicalLicense: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter your medical license/registration number"
                        required
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Building size={16} className="mr-2 text-gray-400" />
                        Clinic/Hospital Affiliation (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                            type="file"
                            name="clinicAffiliation"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id="clinicAffiliation"
                        />
                        <label htmlFor="clinicAffiliation" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Hospital ID or affiliation certificate</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, JPEG, PNG (Max 5MB)</p>
                        </label>
                        {documents.clinicAffiliation && (
                            <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center justify-center">
                                <CheckCircle size={16} className="text-green-600 mr-2" />
                                <span className="text-sm text-green-700">{documents.clinicAffiliation.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading Documents...</span>
                        </>
                    ) : (
                        <>
                            <Shield size={16} />
                            <span>Submit for Verification</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );

    const ProfileOverview = () => {
        if (doctorStatus === 'APPROVED') {
            return (
                <div className="p-8">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 mb-8">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={32} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-emerald-900">Congratulations!</h3>
                                <p className="text-emerald-700">Your profile has been verified and approved</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h4 className="font-semibold text-gray-900 mb-4">What you can do now:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { icon: Calendar, title: 'Manage Schedule', desc: 'Set your availability and time slots' },
                                    { icon: User, title: 'Accept Patients', desc: 'Review and approve appointments' },
                                    { icon: Star, title: 'Build Reputation', desc: 'Provide excellent care and earn reviews' }
                                ].map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Icon size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.title}</p>
                                                <p className="text-sm text-gray-600">{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { label: 'Doctor Name', value: `Dr. ${profileData.firstName} ${profileData.lastName}` },
                                { label: 'Specialization', value: profileData.specialization },
                                { label: 'Experience', value: `${profileData.yearsOfExperience} years` },
                                { label: 'Contact', value: profileData.contactNumber },
                                { label: 'Email', value: profileData.email },
                                { label: 'Consultation Fee', value: profileData.consultationFees ? `₹${profileData.consultationFees}` : 'Not specified' },
                            ].map((item, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                                    <p className="font-semibold text-gray-900">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (doctorStatus === 'PENDING') {
            return (
                <div className="p-8">
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Verification in Progress</h3>
                        <p className="text-amber-800 mb-6">
                            Your documents have been submitted and are currently being reviewed by our medical verification team.
                        </p>
                        <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
                            <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Medical team reviews your credentials (1-2 business days)</li>
                                <li>• You'll receive an email notification once approved</li>
                                <li>• After approval, you can start accepting appointments</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        if (doctorStatus === 'REJECTED') {
            return (
                <div className="p-8">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-red-900 mb-2">Verification Failed</h3>
                        <p className="text-red-800 mb-6">
                            Unfortunately, your doctor verification application has been rejected.
                        </p>
                        {doctorData?.adminNotes && (
                            <div className="bg-white rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                                <p className="text-sm font-medium text-gray-900 mb-2">Admin Notes:</p>
                                <p className="text-sm text-red-700">{doctorData.adminNotes}</p>
                            </div>
                        )}
                        <p className="text-sm text-red-700">
                            Please contact our support team or review and resubmit your documents.
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return <BasicInformationForm />;
            case 'documents':
                return <DocumentsForm />;
            case 'overview':
                return <ProfileOverview />;
            default:
                return <BasicInformationForm />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                    <ProfileHeader />
                    <NavigationTabs />
                    
                    {message.text && (
                        <div className={`mx-8 mt-6 p-4 rounded-xl border ${
                            message.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            <div className="flex items-center space-x-2">
                                {message.type === 'success' ? (
                                    <CheckCircle size={16} />
                                ) : (
                                    <AlertCircle size={16} />
                                )}
                                <span>{message.text}</span>
                            </div>
                        </div>
                    )}
                    
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
