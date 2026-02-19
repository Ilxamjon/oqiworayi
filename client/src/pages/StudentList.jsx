import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Users, Search, Eye, Calendar, CreditCard, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';

const StudentList = () => {
    const [searchParams] = useSearchParams();
    const subjectIdParam = searchParams.get('subjectId');

    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('students');
            setStudents(data);
        } catch (error) {
            console.error('O\'quvchilar yuklanmadi:', error);
        } finally {
            setLoading(false);
        }
    };

    // Davomat statistikasini hisoblash
    const getAttendanceSummary = (student) => {
        if (!student.Attendances || student.Attendances.length === 0) return 'Darslar yo\'q';
        const presentCount = student.Attendances.filter(a => a.status === 'present').length;
        const total = student.Attendances.length;
        return `${presentCount}/${total}`;
    };

    // To'lov statistikasini hisoblash
    const getPaymentSummary = (student) => {
        if (!student.Payments || student.Payments.length === 0) return '0 so\'m';
        const totalAmount = student.Payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        return `${totalAmount.toLocaleString()} so\'m`;
    };

    // Talabalarni filtrlash va guruhlash
    const getFilteredStudents = () => {
        let filtered = students;

        // Qidiruv bo'yicha filtrlash
        if (searchTerm) {
            filtered = filtered.filter(s =>
                s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone?.includes(searchTerm)
            );
        }

        // Fan bo'yicha guruhlash yoki filtrlash
        if (subjectIdParam) {
            return filtered.filter(s => s.Subjects.some(sub => sub.id === parseInt(subjectIdParam)));
        }

        return filtered;
    };

    const displayStudents = getFilteredStudents();

    // Fanlar bo'yicha guruhlash (faqat subjectIdParam bo'lmasa)
    const groupedStudents = {};
    if (!subjectIdParam) {
        displayStudents.forEach(student => {
            if (student.Subjects && student.Subjects.length > 0) {
                student.Subjects.forEach(sub => {
                    if (!groupedStudents[sub.name]) groupedStudents[sub.name] = [];
                    groupedStudents[sub.name].push(student);
                });
            } else {
                if (!groupedStudents['Fani yo\'qlar']) groupedStudents['Fani yo\'qlar'] = [];
                groupedStudents['Fani yo\'qlar'].push(student);
            }
        });
    }

    if (loading) {
        return <div className="text-center py-20">Yuklanmoqda...</div>;
    }

    const TableHeader = () => (
        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
            <tr>
                <th className="px-6 py-3">Ism</th>
                <th className="px-6 py-3 text-center">Davomat</th>
                <th className="px-6 py-3 text-center">To'lovlar</th>
                <th className="px-6 py-3">Telefon</th>
                <th className="px-6 py-3 text-right">Amallar</th>
            </tr>
        </thead>
    );

    const StudentRow = ({ student }) => (
        <tr className="hover:bg-gray-50 border-b">
            <td className="px-6 py-4 font-medium flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-xs">
                    {student.fullName.charAt(0)}
                </div>
                {student.fullName}
            </td>
            <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Calendar className="w-3 h-3 mr-1" />
                    {getAttendanceSummary(student)}
                </span>
            </td>
            <td className="px-6 py-4 text-center font-semibold text-indigo-600">
                <div className="flex items-center justify-center">
                    <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                    {getPaymentSummary(student)}
                </div>
            </td>
            <td className="px-6 py-4 text-gray-500">{student.phone || '-'}</td>
            <td className="px-6 py-4 text-right">
                <Link to={`/student/${student.id}`}>
                    <Button size="sm" variant="ghost" className="hover:text-indigo-600">
                        <Eye className="h-4 w-4 mr-1" />
                        Ko'rish
                    </Button>
                </Link>
            </td>
        </tr>
    );

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
                        <Users className="mr-3 h-10 w-10 text-indigo-500" />
                        O'quvchilar Ro'yxati
                    </h1>
                    <p className="text-gray-500 mt-1">Barcha o'quvchilar va ularning ko'rsatkichlari</p>
                </div>
                <div className="w-full md:w-96 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Ism yoki telefon bo'yicha qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 shadow-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            </header>

            {subjectIdParam ? (
                // Ma'lum bir fan bo'yicha ko'rsatish
                <Card className="overflow-hidden border-none shadow-xl">
                    <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="flex items-center text-indigo-700">
                            <BookOpen className="mr-2 h-5 w-5" />
                            Guruh Ro'yxati
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <TableHeader />
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {displayStudents.map(student => (
                                        <StudentRow key={student.id} student={student} />
                                    ))}
                                    {displayStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                                Hech kim topilmadi
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                // Barcha fanlar bo'yicha guruhlangan holda ko'rsatish
                Object.keys(groupedStudents).map(subjectName => (
                    <div key={subjectName} className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center px-2">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full mr-3 shadow-sm shadow-indigo-200"></span>
                            {subjectName}
                        </h2>
                        <Card className="overflow-hidden border-none shadow-lg">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <TableHeader />
                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                            {groupedStudents[subjectName].map(student => (
                                                <StudentRow key={student.id} student={student} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentList;
