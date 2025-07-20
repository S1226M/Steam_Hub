import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import './UserProfile.css';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileimage || null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.fullname.trim()) {
      setMessage({ type: 'error', text: 'Full name is required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const updateData = new FormData();
      updateData.append('fullname', formData.fullname);
      updateData.append('username', formData.username);
      updateData.append('email', formData.email);
      updateData.append('bio', formData.bio);

      if (profileImage) {
        updateData.append('profileimage', profileImage);
      }

      const response = await userAPI.updateProfile(user._id, updateData);

      if (response.success) {
        // Update local user data
        const updatedUser = {
          ...user,
          ...response.user,
          profileimage: response.user.profileimage || user.profileimage
        };
        updateUser(updatedUser);

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setProfileImage(null);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: user?.fullname || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setProfileImage(null);
    setImagePreview(user?.profileimage || null);
    setIsEditing(false);
    setMessage(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="user-profile-container">
      {/* Message Display */}
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account settings and profile information</p>
      </div>

      <div className="profile-content">
        {/* Profile Image Section */}
        <div className="profile-image-section">
          <div className="profile-image-container">
            <div className="profile-image">
              {imagePreview ? (
                <img src={imagePreview} alt={user?.fullname || 'Profile'} />
              ) : (
                <span>{user?.fullname?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            
            {isEditing && (
              <button 
                className="change-image-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V5C1 4.46957 1.21071 3.96086 1.58579 3.58579C1.96086 3.21071 2.46957 3 3 3H8L10 1H14L16 3H21C21.5304 3 22.0391 3.21071 22.4142 3.58579C22.7893 3.96086 23 4.46957 23 5V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Change Photo
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            {!isEditing && (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="fullname">Full Name *</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isLoading || !formData.fullname.trim()}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="account-info-section">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Member Since</label>
              <span>{formatDate(user?.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Account Type</label>
              <span className={`account-type ${user?.subscription || 'free'}`}>
                {user?.subscription === 'premium' ? 'Premium' : 'Free'}
              </span>
            </div>
            <div className="info-item">
              <label>Last Updated</label>
              <span>{formatDate(user?.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 