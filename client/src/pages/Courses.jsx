import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BookOpen, Check, Pencil, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ price: '', name: '' });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('subjects');
            setSubjects(response.data);
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (subject) => {
        setEditingId(subject.id);
        setEditForm({ price: subject.price, name: subject.name });
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleSave = async (id) => {
        try {
            await api.put(`subjects/${id}`, editForm);
            setEditingId(null);
            fetchSubjects();
        } catch (error) {
            alert("Xatolik yuz berdi");
        }
    };

    if (loading) {
        return <div className="text-center py-20">Yuklanmoqda...</div>;
    }

    const isAdmin = user && user.role === 'admin';

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Mavjud Kurslar</h1>
            <div className="grid md:grid-cols-2 gap-6">
                {subjects.map((subject) => (
                    <Card key={subject.id} className="hover:shadow-lg transition-shadow border-indigo-100 relative group">
                        {isAdmin && !editingId && (
                            <button
                                onClick={() => handleEditClick(subject)}
                                className="absolute top-2 right-2 p-2 bg-indigo-50 rounded-full text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}

                        <CardHeader className="bg-indigo-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <BookOpen className="h-6 w-6 text-indigo-600" />
                                </div>
                                {editingId === subject.id ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                            className="w-32 h-8"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-lg font-bold text-indigo-600">
                                        {parseInt(subject.price).toLocaleString()} UZS
                                    </span>
                                )}
                            </div>
                            {editingId === subject.id ? (
                                <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="mt-4 font-bold"
                                />
                            ) : (
                                <CardTitle className="mt-4 text-xl">{subject.name}</CardTitle>
                            )}
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-center text-gray-600">
                                    <Check className="h-4 w-4 text-green-500 mr-2" />
                                    Haftada 3 kun dars
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check className="h-4 w-4 text-green-500 mr-2" />
                                    Malakali o'qituvchilar
                                </li>
                            </ul>

                            {editingId === subject.id && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                                        <X className="h-4 w-4 mr-1" /> Bekor qilish
                                    </Button>
                                    <Button size="sm" onClick={() => handleSave(subject.id)}>
                                        <Save className="h-4 w-4 mr-1" /> Saqlash
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Courses;
