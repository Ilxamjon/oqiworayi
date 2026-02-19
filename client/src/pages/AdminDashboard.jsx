import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Check, X, Shield, DollarSign, Users, Key, UserCog } from 'lucide-react';

const AdminDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resetModal, setResetModal] = useState({ show: false, teacher: null, newPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsRes, studentsRes, teachersRes] = await Promise.all([
                api.get('payments'),
                api.get('students'),
                api.get('admin/teachers')
            ]);
            setPayments(paymentsRes.data);
            setStudents(studentsRes.data);
            setTeachers(teachersRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, status) => {
        // Implementation needed on backend for status update
        // For now, let's just alert
        alert(`To'lov ${status} qilindi (Backend API kerak)`);
    };

    const handleResetPassword = async () => {
        if (!resetModal.newPassword || resetModal.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
            return;
        }

        try {
            const { data } = await api.put(`admin/reset-password/${resetModal.teacher.id}`, {
                newPassword: resetModal.newPassword
            });
            setMessage({ type: 'success', text: `${resetModal.teacher.fullName} uchun parol muvaffaqiyatli tiklandi` });
            setResetModal({ show: false, teacher: null, newPassword: '' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Xatolik yuz berdi' });
        }
    };

    if (loading) return <div className="text-center py-20">Yuklanmoqda...</div>;

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Shield className="mr-3 h-8 w-8 text-indigo-600" />
                        Admin Paneli
                    </h1>
                    <p className="text-gray-500 mt-2">Barcha jarayonlarni boshqarish markazi</p>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-4 bg-green-100 rounded-full mr-4">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Jami To'lovlar</p>
                            <h3 className="text-2xl font-bold">{payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} UZS</h3>
                        </div>
                    </CardContent>
                </Card>
                <Link to="/students">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="flex items-center p-6">
                            <div className="p-4 bg-blue-100 rounded-full mr-4">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Jami O'quvchilar</p>
                                <h3 className="text-2xl font-bold">{students.length}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>To'lovlar Ro'yxati</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">O'quvchi</th>
                                    <th className="px-6 py-3">Summa</th>
                                    <th className="px-6 py-3">Holati</th>
                                    <th className="px-6 py-3">Chek</th>
                                    <th className="px-6 py-3 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{payment.Student?.fullName}</td>
                                        <td className="px-6 py-4">{payment.amount.toLocaleString()} UZS</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.receiptImage ? (
                                                <a href={`http://localhost:5000/uploads/${payment.receiptImage}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                                                    Ko'rish
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0" onClick={() => handleApprove(payment.id, 'approved')}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="danger" className="h-8 w-8 p-0" onClick={() => handleApprove(payment.id, 'rejected')}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* O'qituvchilar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <UserCog className="mr-2 h-5 w-5" />
                        O'qituvchilar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {message.text && (
                        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Ism</th>
                                    <th className="px-6 py-3">Foydalanuvchi Nomi</th>
                                    <th className="px-6 py-3 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{teacher.fullName}</td>
                                        <td className="px-6 py-4">{teacher.username}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setResetModal({ show: true, teacher, newPassword: '' })}
                                                className="flex items-center"
                                            >
                                                <Key className="mr-1 h-4 w-4" />
                                                Parolni Tiklash
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Parol Tiklash Modal */}
            {resetModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Parolni Tiklash</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>{resetModal.teacher?.fullName}</strong> uchun yangi parol kiriting
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Yangi Parol</label>
                                <Input
                                    type="text"
                                    value={resetModal.newPassword}
                                    onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
                                    placeholder="Kamida 6 ta belgi"
                                    autoFocus
                                />
                            </div>
                            <div className="flex space-x-3">
                                <Button onClick={handleResetPassword} className="flex-1">
                                    Tasdiqlash
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setResetModal({ show: false, teacher: null, newPassword: '' })}
                                    className="flex-1"
                                >
                                    Bekor qilish
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
