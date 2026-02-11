import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader2, UploadCloud, CreditCard, Copy, Check } from 'lucide-react';

const Payment = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const CARD_NUMBER = "8600 0000 0000 0000";
    const CARD_HOLDER = "O'quv Markazi";

    useEffect(() => {
        api.get('/students').then((res) => setStudents(res.data));
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedStudent) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('studentId', selectedStudent);
        formData.append('amount', amount);
        formData.append('receipt', file);

        try {
            await api.post('/payments/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert("Chek muvaffaqiyatli yuklandi!");
            setAmount('');
            setFile(null);
            setSelectedStudent('');
        } catch (error) {
            console.error(error);
            alert("Xatolik: " + error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            {/* Card Info */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>To'lov uchun karta</span>
                        <CreditCard className="h-6 w-6 opacity-75" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                            <span className="text-2xl font-mono tracking-wider">{CARD_NUMBER}</span>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                title="Nusxalash"
                            >
                                {copied ? <Check className="h-5 w-5 text-green-300" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-indigo-100 uppercase tracking-wider mb-1">Karta egasi</p>
                                <p className="font-medium text-lg">{CARD_HOLDER}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-indigo-100 uppercase tracking-wider mb-1">To'lov turi</p>
                                <p className="font-medium">UzCard / Humo</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Chekni yuborish</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">O'quvchi</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    required
                                >
                                    <option value="">O'quvchini tanlang</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.fullName} ({s.phone})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Summa (SO'M)</label>
                                <Input
                                    type="number"
                                    placeholder="500000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium block">Chek Rasmi (Click/Payme)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50/50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    required
                                />
                                <div className="flex flex-col items-center">
                                    <div className="p-4 bg-indigo-50 rounded-full mb-3">
                                        <UploadCloud className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Rasm yuklash uchun bosing</span>
                                    <span className="text-sm text-gray-500 mt-1">
                                        {file ? file.name : "Yoki faylni shu yerga tashlang"}
                                    </span>
                                </div>
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

export default Payment;
