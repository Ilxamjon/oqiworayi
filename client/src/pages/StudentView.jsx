import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { User, Calendar, DollarSign, BookOpen } from 'lucide-react';

const StudentView = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    const DAILY_RATE = 19231; // Kunlik to'lov (so'm)

    useEffect(() => {
        fetchStudentData();
    }, [id]);

    const fetchStudentData = async () => {
        try {
            // O'quvchi ma'lumotlari
            const studentsRes = await api.get('/students');
            const studentData = studentsRes.data.find(s => s.id === parseInt(id));
            setStudent(studentData);

            // Davomat ma'lumotlari
            const attendanceRes = await api.get('/attendance');
            const studentAttendance = attendanceRes.data.filter(
                a => a.StudentId === parseInt(id) && a.status === 'present'
            );
            setAttendance(studentAttendance);
        } catch (error) {
            console.error('Ma\'lumotlar yuklanmadi:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePayment = () => {
        const presentDays = attendance.length;
        return presentDays * DAILY_RATE;
    };

    const groupAttendanceByMonth = () => {
        const grouped = {};

        attendance.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(record);
        });

        return grouped;
    };

    const formatMonthName = (monthKey) => {
        const [year, month] = monthKey.split('-');
        const months = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
            'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
        ];
        return `${months[parseInt(month) - 1]} ${year}`;
    };

    if (loading) {
        return <div className="text-center py-20">Yuklanmoqda...</div>;
    }

    if (!student) {
        return <div className="text-center py-20">O'quvchi topilmadi</div>;
    }

    const monthlyAttendance = groupAttendanceByMonth();
    const totalPayment = calculatePayment();

    return (
        <div className="max-w-6xl mx-auto py-10 space-y-6">
            {/* O'quvchi Ma'lumotlari */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <User className="mr-3 h-7 w-7 text-indigo-600" />
                        O'quvchi Ma'lumotlari
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">To'liq Ism</p>
                            <p className="text-lg font-semibold">{student.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Sinf</p>
                            <p className="text-lg font-semibold">{student.grade}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Telefon</p>
                            <p className="text-lg font-semibold">{student.phone || 'Kiritilmagan'}</p>
                        </div>
                    </div>

                    {student.Subjects && student.Subjects.length > 0 && (
                        <div className="mt-6">
                            <p className="text-sm text-gray-500 mb-2">Fanlar</p>
                            <div className="flex flex-wrap gap-2">
                                {student.Subjects.map(subject => (
                                    <span
                                        key={subject.id}
                                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                    >
                                        {subject.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* To'lov Hisob-kitobi */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <DollarSign className="mr-3 h-7 w-7 text-green-600" />
                        To'lov Hisob-kitobi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Kunlik Tarif</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {DAILY_RATE.toLocaleString()} so'm
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">Qatnashgan Kunlar</p>
                            <p className="text-2xl font-bold text-green-900">
                                {attendance.length} kun
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <p className="text-sm text-indigo-600 font-medium">Jami To'lov</p>
                            <p className="text-2xl font-bold text-indigo-900">
                                {totalPayment.toLocaleString()} so'm
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Hisoblash:</strong> {attendance.length} kun × {DAILY_RATE.toLocaleString()} so'm = {totalPayment.toLocaleString()} so'm
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Davomat Tarixi */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                        <Calendar className="mr-3 h-7 w-7 text-purple-600" />
                        Davomat Tarixi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {Object.keys(monthlyAttendance).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Davomat ma'lumotlari yo'q</p>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(monthlyAttendance)
                                .sort()
                                .reverse()
                                .map(monthKey => (
                                    <div key={monthKey}>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
                                            {formatMonthName(monthKey)}
                                            <span className="ml-2 text-sm font-normal text-gray-500">
                                                ({monthlyAttendance[monthKey].length} kun)
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {monthlyAttendance[monthKey]
                                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                .map((record, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
                                                    >
                                                        <p className="text-xs text-green-600 font-medium">
                                                            {new Date(record.date).toLocaleDateString('uz-UZ', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {record.Subject?.name || 'Fan'}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            To'lov: {monthlyAttendance[monthKey].length} × {DAILY_RATE.toLocaleString()} = {(monthlyAttendance[monthKey].length * DAILY_RATE).toLocaleString()} so'm
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentView;
