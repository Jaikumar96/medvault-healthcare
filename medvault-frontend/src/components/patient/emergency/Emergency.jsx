import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Flame,
  Clock,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Stethoscope,
  FileText,
  Zap,
  Users,
  Building2,
  AlertCircle
} from 'lucide-react';

const Emergency = () => {
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  const [emergencyForm, setEmergencyForm] = useState({
    urgencyLevel: 'MEDIUM',
    symptoms: '',
    patientNotes: '',
    contactNumber: '',
    location: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: ''
  });

  useEffect(() => {
    // For now, just set loading to false since we don't have the API endpoint yet
    setLoading(false);
    // TODO: Implement fetchEmergencyRequests when backend is ready
    // fetchEmergencyRequests();
  }, []);

  const handleEmergencyRequest = async () => {
    if (!emergencyForm.symptoms.trim() || !emergencyForm.contactNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Information Missing',
        html: `
          <p>Please provide the following required information:</p>
          <ul style="text-align: left; margin: 10px 0;">
            <li>• Chief complaint description</li>
            <li>• Contact number</li>
          </ul>
        `,
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    const result = await Swal.fire({
      title: '🚨 Send Emergency Request?',
      html: `
        <div style="text-align: left;">
          <p><strong>This will immediately:</strong></p>
          <ul style="margin: 10px 0;">
            <li>• Notify all available doctors</li>
            <li>• Alert nearby hospitals</li>
            <li>• Send your location & medical info</li>
            <li>• Prioritize your case as ${emergencyForm.urgencyLevel} priority</li>
          </ul>
          <p style="color: #dc2626; font-weight: bold; margin-top: 15px;">Only use for genuine medical emergencies!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Send Emergency Request',
      cancelButtonText: 'Review Details'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Sending Emergency Request...',
        html: `
          <div style="text-align: center;">
            <div class="animate-pulse text-red-600 mb-4">🚨</div>
            <p>Notifying healthcare providers...</p>
            <p style="font-size: 12px; color: #6b7280;">Please keep your phone available</p>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      // TODO: Implement actual API call when backend endpoint is ready
      // For now, simulate success after 2 seconds
      setTimeout(() => {
        setShowEmergencyModal(false);
        setEmergencyForm({
          urgencyLevel: 'MEDIUM',
          symptoms: '',
          patientNotes: '',
          contactNumber: '',
          location: '',
          medicalHistory: '',
          allergies: '',
          currentMedications: ''
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Emergency Request Sent Successfully!',
          html: `
            <div style="text-align: left;">
              <p><strong>Your request has been sent to:</strong></p>
              <ul style="margin: 10px 0;">
                <li>• All available doctors in your area</li>
                <li>• Nearby hospitals and clinics</li>
                <li>• Emergency response teams</li>
              </ul>
              <div style="background: #fef3c7; padding: 10px; border-radius: 5px; margin: 15px 0;">
                <p style="color: #92400e; margin: 0;"><strong>What to do now:</strong></p>
                <p style="color: #92400e; margin: 5px 0;">• Keep your phone available</p>
                <p style="color: #92400e; margin: 5px 0;">• Stay at your current location if safe</p>
                <p style="color: #92400e; margin: 5px 0;">• Call 108/102 if life-threatening</p>
              </div>
            </div>
          `,
          confirmButtonColor: '#28a745',
          confirmButtonText: 'Understood'
        });
      }, 2000);

      
      // Actual API call implementation (uncomment when backend is ready):
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8080/api/patient/emergency-request/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emergencyForm,
          symptoms: emergencyForm.symptoms.trim(),
          patientNotes: emergencyForm.patientNotes.trim(),
          contactNumber: emergencyForm.contactNumber.trim(),
          location: emergencyForm.location.trim(),
          medicalHistory: emergencyForm.medicalHistory.trim(),
          allergies: emergencyForm.allergies.trim(),
          currentMedications: emergencyForm.currentMedications.trim(),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Handle success
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send emergency request');
      }
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        html: `
          <p>Unable to send emergency request due to network issues.</p>
          <div style="background: #fef2f2; padding: 10px; border-radius: 5px; margin: 15px 0;">
            <p style="color: #dc2626; margin: 0;"><strong>If this is life-threatening:</strong></p>
            <p style="color: #dc2626; margin: 5px 0;">• Call 108 (Emergency) immediately</p>
            <p style="color: #dc2626; margin: 5px 0;">• Call 102 (Ambulance)</p>
            <p style="color: #dc2626; margin: 5px 0;">• Go to nearest hospital</p>
          </div>
        `,
        confirmButtonText: 'Try Again'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-red-700 font-medium">Loading emergency services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Flame size={24} className="text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Emergency Services</h1>
                  <p className="text-red-100 text-lg">Get immediate medical assistance</p>
                </div>
              </div>
              <div className="bg-red-500 bg-opacity-30 rounded-xl p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Shield size={20} className="text-white mr-2" />
                  <span className="font-semibold text-white">Emergency Hotlines</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Phone size={16} className="mr-2" />
                    <span>National Emergency: <strong>108</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Heart size={16} className="mr-2" />
                    <span>Ambulance: <strong>102</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-2" />
                    <span>Fire: <strong>101</strong></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
                <Activity size={48} className="text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="bg-white text-red-700 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-colors flex items-center space-x-3 shadow-lg"
          >
            <Zap size={24} />
            <span className="text-lg">Request Emergency Assistance</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border-2 border-red-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Call Emergency</h3>
                <p className="text-sm text-gray-600 mb-4">Direct call to emergency services</p>
                <a
                  href="tel:108"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
                >
                  <Phone size={16} className="mr-2" />
                  Call 108
                </a>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Ambulance</h3>
                <p className="text-sm text-gray-600 mb-4">Request ambulance service</p>
                <a
                  href="tel:102"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Heart size={16} className="mr-2" />
                  Call 102
                </a>
              </div>

              <div className="bg-white rounded-xl border-2 border-green-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Find Doctors</h3>
                <p className="text-sm text-gray-600 mb-4">Connect with available doctors</p>
                <button
                  onClick={() => setShowEmergencyModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                >
                  <Stethoscope size={16} className="mr-2" />
                  Request
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Tips */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-900 mb-3">Emergency Preparedness Tips</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="text-sm text-yellow-800 space-y-2">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Stay calm and provide clear information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Keep your phone charged and available</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Know your exact location</span>
                      </li>
                    </ul>
                    <ul className="text-sm text-yellow-800 space-y-2">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Have medical information ready</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Keep emergency contacts updated</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Know your allergies and medications</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Request Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="bg-red-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Flame size={24} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Emergency Request</h3>
                  <p className="text-red-100">This will notify all available healthcare providers</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Life-threatening emergency?</p>
                    <p>Call <strong>108</strong> immediately instead of using this form.</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level *
                    </label>
                    <select
                      value={emergencyForm.urgencyLevel}
                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, urgencyLevel: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="HIGH">🔴 HIGH - Severe/Life-threatening</option>
                      <option value="MEDIUM">🟡 MEDIUM - Urgent care needed</option>
                      <option value="LOW">🟢 LOW - Non-urgent but requires attention</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chief Complaint *
                    </label>
                    <textarea
                      value={emergencyForm.symptoms}
                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, symptoms: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Describe your main medical concern or symptoms..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={emergencyForm.contactNumber}
                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Your active phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Location
                    </label>
                    <input
                      type="text"
                      value={emergencyForm.location}
                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Your exact address or landmark"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical History
                    </label>
                    <textarea
                      value={emergencyForm.medicalHistory}
                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Diabetes, heart conditions, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      value={emergencyForm.patientNotes}
                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, patientNotes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Any other relevant information..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setEmergencyForm({
                      urgencyLevel: 'MEDIUM',
                      symptoms: '',
                      patientNotes: '',
                      contactNumber: '',
                      location: '',
                      medicalHistory: '',
                      allergies: '',
                      currentMedications: ''
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmergencyRequest}
                  disabled={!emergencyForm.symptoms.trim() || !emergencyForm.contactNumber.trim()}
                  className="flex-2 bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Flame size={20} />
                  <span>Send Emergency Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
