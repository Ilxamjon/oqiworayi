import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, Camera, Loader2, Check } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Profil ma'lumotlari
    const [profileData, setProfileData] = useState({
        fullName: '',
        username: ''
    });

    // Parol o'zgartirish
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Profil rasmi
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile');
            setProfileData({
                fullName: data.fullName || '',
                username: data.username || ''
            });
            if (data.profilePicture) {
                setPreviewUrl(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/profile-pictures/${data.profilePicture}`);
            }
        } catch (err) {
            console.error('Profil yuklanmadi:', err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await api.put('/profile', profileData);
            setSuccess('Profil muvaffaqiyatli yangilandi');

            // AuthContext ni yangilash
            if (updateProfile) {
                updateProfile(data.user);
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Yangi parollar mos kelmadi');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
            setLoading(false);
            return;
        }

        try {
            await api.put('/profile/password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Parol muvaffaqiyatli o\'zgartirildi');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePictureUpload = async () => {
        if (!profilePicture) {
            setError('Iltimos, rasm tanlang');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('profilePicture', profilePicture);

        try {
            await api.post('/profile/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Profil rasmi muvaffaqiyatli yuklandi');
            setProfilePicture(null);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <User className="mr-3 h-8 w-8 text-indigo-600" />
                    Profil
                </h1>
                <p className="text-gray-500 mt-2">Shaxsiy ma'lumotlaringizni boshqaring</p>
            </header>

            {/* Xabarlar */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Profil Rasmi */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Camera className="mr-2 h-5 w-5" />
                        Profil Rasmi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profil"
                                    className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <User className="h-12 w-12 text-indigo-600" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePictureChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <p className="text-xs text-gray-500 mt-2">JPG, PNG yoki GIF. Maksimal 5MB.</p>
                            {profilePicture && (
                                <Button
                                    onClick={handlePictureUpload}
                                    disabled={loading}
                                    className="mt-3"
                                    size="sm"
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Yuklash
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profil Ma'lumotlari */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Shaxsiy Ma'lumotlar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">To'liq Ism</label>
                            <Input
                                value={profileData.fullName}
                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                placeholder="Ism Familiya"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Foydalanuvchi Nomi</label>
                            <Input
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                placeholder="username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Rol</label>
                            <Input
                                value={user?.role === 'admin' ? 'Administrator' : 'O\'qituvchi'}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Saqlash
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Parol O'zgartirish */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Lock className="mr-2 h-5 w-5" />
                        Parolni O'zgartirish
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Eski Parol</label>
                            <Input
                                type="password"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                placeholder="Eski parolingizni kiriting"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Yangi Parol</label>
                            <Input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                placeholder="Yangi parol (kamida 6 ta belgi)"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Parolni Tasdiqlash</label>
                            <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="Yangi parolni qayta kiriting"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Parolni O'zgartirish
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
