import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const { auth } = useContext(AuthContext);
    const [profileFile, setProfileFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(user.profilePhoto);
    const [coverPreview, setCoverPreview] = useState(user.coverPhoto);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        if (type === 'profile') {
            setProfileFile(file);
            setProfilePreview(previewUrl);
        } else {
            setCoverFile(file);
            setCoverPreview(previewUrl);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'multipart/form-data' } };
        let updatedProfile = {};

        try {
            if (profileFile) {
                const formData = new FormData();
                formData.append('profilePhoto', profileFile);
                const res = await API.post('/users/upload-profile-photo', formData, config);
                updatedProfile.profilePhoto = res.data.profilePhoto;
            }
            if (coverFile) {
                const formData = new FormData();
                formData.append('coverPhoto', coverFile);
                const res = await API.post('/users/upload-cover-photo', formData, config);
                updatedProfile.coverPhoto = res.data.coverPhoto;
            }
            onUpdate(updatedProfile);
            onClose();
        } catch (error) {
            console.error("Failed to upload photos", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                <div>
                    <label className="font-semibold">Cover Photo</label>
                    <div className="mt-2 h-48 bg-gray-200 rounded-lg flex items-center justify-center relative cursor-pointer hover:bg-gray-300">
                        {coverPreview ? <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg" /> : <span className="text-gray-500">Click to upload</span>}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="font-semibold">Profile Photo</label>
                    <div className="mt-2 w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center relative mx-auto cursor-pointer hover:bg-gray-300">
                        {profilePreview ? <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover rounded-full" /> : <span className="text-gray-500 text-center text-sm">Click to upload</span>}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;