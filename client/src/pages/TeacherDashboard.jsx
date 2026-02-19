import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, Users, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch only subjects assigned to this teacher
        api.get('subjects')
            .then(res => setSubjects(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-20">Yuklanmoqda...</div>;

    return (
        <div className="space-y-8">
            <header className="mb-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                <h1 className="text-3xl font-bold flex items-center">
                    <BookOpen className="mr-3 h-8 w-8" />
                    Xush kelibsiz, {user?.fullName || 'Ustoz'}!
                </h1>
                <p className="mt-2 text-indigo-100">Bugungi darslarni boshlashga tayyormisiz?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500" onClick={() => window.location.href = '/attendance'}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Davomatni Belgilash</h3>
                            <p className="text-gray-500">Bugungi darsga qatnashganlarni ro'yxatga olish</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CalendarCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => navigate('/students')}>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">O'quvchilar Ro'yxati</h3>
                            <p className="text-gray-500">Sizning guruhlaringizdagi o'quvchilar</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Sizning Fanlaringiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subjects.map(sub => (
                    <Card key={sub.id} className="bg-white border border-gray-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg text-indigo-700">{sub.name}</CardTitle>
                                <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full font-medium">Aktive</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">Haftada 3 kun</p>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/students?subjectId=${sub.id}`)}>
                                Guruhni Ko'rish
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TeacherDashboard;
