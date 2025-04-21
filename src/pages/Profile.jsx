import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaLock, FaBell, FaCreditCard, FaTrash } from 'react-icons/fa';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    joinDate: 'January 1, 2024',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the profile
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <img
                src="/images/profile-placeholder.svg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="w-5 h-5 mr-2" />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="w-5 h-5 mr-2" />
                      <span>{userData.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="w-5 h-5 mr-2" />
                      <span>{userData.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="w-5 h-5 mr-2" />
                      <span>Joined {userData.joinDate}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleEditProfile}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaEdit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <FaLock className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700">Change Password</span>
                </div>
                <FaEdit className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <FaBell className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700">Notification Settings</span>
                </div>
                <FaEdit className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <FaCreditCard className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700">Payment Methods</span>
                </div>
                <FaEdit className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                <div className="flex items-center">
                  <FaTrash className="w-5 h-5 mr-3" />
                  <span>Delete Account</span>
                </div>
                <FaEdit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 