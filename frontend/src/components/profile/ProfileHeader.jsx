import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiEdit3, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { updateProfileDetails } from '../../redux/slices/profileSlice.js';
import { apiClient } from '../../services/apiClient.js';
import toast from 'react-hot-toast';
import defaultBanner from '../../assets/banner_dream_infinity.jpg';

export const ProfileHeader = ({ profile, activity, isPublic = false }) => {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  
  // Form fields
  const [name, setName] = useState(activity?.user?.name || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [coverBanner, setCoverBanner] = useState(profile?.coverBanner || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.user?.avatar?.url || activity?.user?.avatar?.url || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(profile?.availabilityStatus || 'open');

  useEffect(() => {
    if (activity?.user) {
      setName(activity.user.name || '');
    }
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setCoverBanner(profile.coverBanner || '');
      setAvatarUrl(profile.user?.avatar?.url || activity?.user?.avatar?.url || '');
      setAvailabilityStatus(profile.availabilityStatus || 'open');
    }
  }, [profile, activity]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'favour-ai/avatars');

    const uploadToast = toast.loading('Uploading profile photo...');
    try {
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setAvatarUrl(response.data.url);
        toast.success('Photo uploaded successfully!', { id: uploadToast });
      } else {
        toast.error('Upload failed.', { id: uploadToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error uploading photo.', { id: uploadToast });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        headline,
        bio,
        phone,
        location,
        coverBanner,
        avatarUrl,
        availabilityStatus,
        socialLinks: profile?.socialLinks // preserve links
      };
      
      // If cover or avatar is provided, pass them
      const result = await dispatch(updateProfileDetails(payload));
      if (updateProfileDetails.fulfilled.match(result)) {
        toast.success('Personal details updated successfully!');
        setEditing(false);
      } else {
        toast.error('Failed to update details.');
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'actively_looking': return 'Actively Job Hunting';
      case 'open': return 'Open to Opportunities';
      case 'not_looking': return 'Not Looking';
      default: return 'Open to Opportunities';
    }
  };

  // Banner details
  const bannerBg = coverBanner || defaultBanner;
  const userAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activity?.user?.name || 'User')}`;

  return (
    <>
      <div className="glass-card rounded-3xl overflow-hidden hover-action-card">
        {/* Banner */}
        <div className="profile-banner-wrapper">
          <img 
            src={bannerBg} 
            alt="Profile cover banner" 
            className="profile-banner-image"
          />
          <div className="profile-avatar-overlay">
            <img 
              src={userAvatar} 
              alt="Profile Avatar" 
              className="profile-avatar-image"
            />
          </div>
        </div>

        {/* Header Info */}
        <div className="profile-header-content flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-violet-100">{activity?.user?.name || 'Professional User'}</h1>
              <span className={`availability-badge ${availabilityStatus}`}>
                <span className="h-2 w-2 rounded-full bg-current animate-pulse"></span>
                {getStatusLabel(availabilityStatus)}
              </span>
            </div>
            
            <p className="text-violet-300 font-medium text-sm md:text-base mt-1.5">{headline || 'Interview Candidate @ Dream Infinity'}</p>
            
            {bio && <p className="text-violet-100/70 text-sm mt-3.5 max-w-2xl leading-relaxed">{bio}</p>}
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4 text-xs md:text-sm text-violet-100/50">
              {location && (
                <span className="flex items-center gap-1">
                  <FiMapPin /> {location}
                </span>
              )}
              {!profile?.privacySettings?.hideEmail && activity?.user?.email && (
                <span className="flex items-center gap-1">
                  <FiMail /> {activity?.user?.email}
                </span>
              )}
              {!profile?.privacySettings?.hidePhone && phone && (
                <span className="flex items-center gap-1">
                  <FiPhone /> {phone}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!isPublic && (
            <div className="card-actions no-print">
              <button 
                onClick={() => setEditing(true)} 
                className="secondary-button !py-2 !px-3.5 !text-xs"
              >
                <FiEdit3 className="text-sm" /> Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {editing && (
        <div className="community-modal no-print">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-lg font-bold text-violet-100">Edit Personal Details</h2>
            
            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Full Name
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="field mt-1" 
                  required 
                />
              </label>
              
              <label className="block text-xs text-violet-100/70">
                Headline
                <input 
                  type="text" 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="e.g. Full Stack Engineer | React Specialist" 
                  className="field mt-1" 
                />
              </label>
            </div>

            <label className="block text-xs text-violet-100/70">
              Professional Bio
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Write a brief overview of your background, experience, and interests..." 
                className="field mt-1 h-20" 
              />
            </label>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Phone Number
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="e.g. +1 (555) 123-4567" 
                  className="field mt-1" 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Location
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="e.g. San Francisco, CA" 
                  className="field mt-1" 
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Profile Photo (Avatar URL)
                <input 
                  type="url" 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)} 
                  placeholder="https://example.com/avatar.jpg" 
                  className="field mt-1" 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Or Upload Profile Photo
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="field mt-1 bg-[#090811] text-violet-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700" 
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="block text-xs text-violet-100/70">
                Cover Photo URL
                <input 
                  type="url" 
                  value={coverBanner} 
                  onChange={(e) => setCoverBanner(e.target.value)} 
                  placeholder="https://example.com/cover.jpg" 
                  className="field mt-1" 
                />
              </label>

              <label className="block text-xs text-violet-100/70">
                Availability Status
                <select 
                  value={availabilityStatus} 
                  onChange={(e) => setAvailabilityStatus(e.target.value)} 
                  className="field mt-1 bg-neutral-900"
                >
                  <option value="open">Open to Opportunities</option>
                  <option value="actively_looking">Actively Looking</option>
                  <option value="not_looking">Not Looking</option>
                </select>
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setEditing(false)} 
                className="secondary-button !py-2 !px-4 !text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary-button !w-auto !py-2 !px-5 !text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
