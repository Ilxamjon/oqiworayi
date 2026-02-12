import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Users, Search, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        // Qidiruv
        if (searchTerm) {
            const filtered = students.filter(student =>
                student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.grade.toString().includes(searchTerm) ||
                (student.phone && student.phone.includes(searchTerm))
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [searchTerm, students]);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/students');
            setStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error('O\'quvchilar yuklanmadi:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20">Yuklanmoqda...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-10 space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Users className="mr-3 h-8 w-8 text-indigo-600" />
                    O'quvchilar Ro'yxati
                </h1>
                <p className="text-gray-500 mt-2">Jami {students.length} ta o'quvchi</p>
            </header>

            {/* Qidiruv */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Ism, sinf yoki telefon bo'yicha qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* O'quvchilar jadvali */}
            <Card>
                <CardHeader>
                    <CardTitle>O'quvchilar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Ism</th>
                                    <th className="px-6 py-3">Sinf</th>
                                    <th className="px-6 py-3">Telefon</th>
                                    <th className="px-6 py-3">Fanlar</th>
                                    <th className="px-6 py-3 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            O'quvchilar topilmadi
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{student.fullName}</td>
                                            <td className="px-6 py-4">{student.grade}-sinf</td>
                                            <td className="px-6 py-4">{student.phone || '-'}</td>
                                            <td className="px-6 py-4">
                                                {student.Subjects && student.Subjects.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {student.Subjects.map(subject => (
                                                            <span
                                                                key={subject.id}
                                                                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                                                            >
                                                                {subject.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/student/${student.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Ko'rish
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentList;
