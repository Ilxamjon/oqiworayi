import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import PhoneInput from '../components/PhoneInput';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Check, Loader2, Copy } from 'lucide-react';
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
    const [credentials, setCredentials] = useState(null);

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
            const { data } = await api.post('/students', formData);
            setCredentials(data.credentials);
            setSuccess(true);
        } catch (error) {
            alert('Xatolik yuz berdi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Nusxalandi!');
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-50 duration-300">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Muvaffaqiyatli!</h2>
                <p className="text-gray-600 mb-6">Siz ro'yxatdan o'tdingiz. Quyidagi ma'lumotlar bilan tizimga kirishingiz mumkin.</p>

                {credentials && (
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle className="text-center">Login Ma'lumotlari</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800 mb-2">
                                    ⚠️ Bu ma'lumotlarni yozib oling! Ular faqat bir marta ko'rsatiladi.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Login</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-mono font-bold">{credentials.username}</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(credentials.username)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Parol</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-mono font-bold">{credentials.password}</p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(credentials.password)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full mt-4"
                            >
                                Tizimga Kirish
                            </Button>
                        </CardContent>
                    </Card>
                )}
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
                            <PhoneInput
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sinf</label>
                            <Input
                                name="grade"
                                type="number"
                                placeholder="Masalan: 5, 7, 10"
                                required
                                value={formData.grade}
                                onChange={handleChange}
                                min="1"
                                max="11"
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
