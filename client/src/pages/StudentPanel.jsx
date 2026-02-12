import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { User, BookOpen, Calendar, DollarSign } from 'lucide-react';

const StudentPanel = () => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.id) {
            fetchStudentData();
        }
    }, [user]);

    const fetchStudentData = async () => {
        try {
            // O'quvchi ma'lumotlarini olish
            const { data: student } = await api.get(`/students/${user.id}`);
            setStudentData(student);

            // Davomat ma'lumotlarini olish
            const { data: attendanceData } = await api.get(`/attendance/student/${user.id}`);
            setAttendance(attendanceData);
        } catch (error) {
            console.error('Ma\'lumotlar yuklanmadi:', error);
        } finally {
            setLoading(false);
        }
    };

    // Davomat statistikasi
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const totalPayment = presentDays * 19231;

    if (loading) {
        return <div className="text-center py-20">Yuklanmoqda...</div>;
    }

    if (!studentData) {
        return <div className="text-center py-20">Ma'lumotlar topilmadi</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-10 space-y-6">
            {/* Xush kelibsiz */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Xush kelibsiz, {studentData.fullName}!
                </h1>
                <p className="text-gray-500 mt-2">{studentData.grade}-sinf o'quvchisi</p>
            </header>

            {/* Statistika kartlari */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Qatnashgan kunlar</p>
                                <p className="text-3xl font-bold text-green-600">{presentDays}</p>
                            </div>
                            <Calendar className="h-12 w-12 text-green-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Qatnashmagan kunlar</p>
                                <p className="text-3xl font-bold text-red-600">{absentDays}</p>
                            </div>
                            <Calendar className="h-12 w-12 text-red-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Jami to'lov</p>
                                <p className="text-3xl font-bold text-indigo-600">
                                    {totalPayment.toLocaleString()} so'm
                                </p>
                            </div>
                            <DollarSign className="h-12 w-12 text-indigo-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Shaxsiy ma'lumotlar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Shaxsiy Ma'lumotlar
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">To'liq ism</p>
                            <p className="font-medium">{studentData.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Sinf</p>
                            <p className="font-medium">{studentData.grade}-sinf</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Telefon</p>
                            <p className="font-medium">{studentData.phone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Login</p>
                            <p className="font-medium font-mono">{studentData.username}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fanlar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Fanlar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {studentData.Subjects && studentData.Subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {studentData.Subjects.map(subject => (
                                <span
                                    key={subject.id}
                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium"
                                >
                                    {subject.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Fanlar biriktirilmagan</p>
                    )}
                </CardContent>
            </Card>

            {/* Oxirgi davomatlar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Oxirgi Davomatlar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {attendance.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Sana</th>
                                        <th className="px-4 py-2 text-left">Fan</th>
                                        <th className="px-4 py-2 text-left">Holat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {attendance.slice(0, 10).map((record) => (
                                        <tr key={record.id}>
                                            <td className="px-4 py-2">
                                                {new Date(record.date).toLocaleDateString('uz-UZ')}
                                            </td>
                                            <td className="px-4 py-2">
                                                {record.Subject?.name || '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${record.status === 'present'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {record.status === 'present' ? 'Keldi' : 'Kelmadi'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">Davomat ma'lumotlari yo'q</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentPanel;
