import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        grade: '',
        subjectIds: [],
    });
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.get('/subjects').then((res) => setSubjects(res.data));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubjectToggle = (id) => {
        setFormData((prev) => {
            const ids = prev.subjectIds.includes(id)
                ? prev.subjectIds.filter((sid) => sid !== id)
                : [...prev.subjectIds, id];
            return { ...prev, subjectIds: ids };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/students', formData);
            setSuccess(true);
            setTimeout(() => navigate('/courses'), 2000);
        } catch (error) {
            alert('Xatolik yuz berdi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-50 duration-300">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Muvaffaqiyatli!</h2>
                <p className="text-gray-600">Siz ro'yxatdan o'tdingiz. Tez orada siz bilan bog'lanamiz.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Ro'yxatdan O'tish</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">F.I.SH</label>
                            <Input
                                name="fullName"
                                placeholder="Ism Familiya"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Telefon Raqam</label>
                            <Input
                                name="phone"
                                placeholder="+998 90 123 45 67"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sinf</label>
                            <Input
                                name="grade"
                                placeholder="Masalan: 5-sinf"
                                required
                                value={formData.grade}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">Kurslarni tanlang</label>
                            <div className="grid grid-cols-1 gap-2">
                                {subjects.map((subject) => (
                                    <div
                                        key={subject.id}
                                        onClick={() => handleSubjectToggle(subject.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.subjectIds.includes(subject.id)
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <span className="font-medium">{subject.name}</span>
                                        {formData.subjectIds.includes(subject.id) && (
                                            <Check className="h-4 w-4 text-indigo-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Yuborish
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
