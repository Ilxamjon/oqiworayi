import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader2, LogIn } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const prefilledData = location.state || {};

    const [username, setUsername] = useState(prefilledData.username || '');
    const [password, setPassword] = useState(prefilledData.password || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isStudent, setIsStudent] = useState(prefilledData.isStudent || false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // O'quvchi yoki admin/teacher login
            const endpoint = isStudent ? 'student-auth/login' : 'auth/login';
            const user = await login(username, password, endpoint);

            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'teacher') navigate('/teacher');
            else if (user.role === 'student') navigate('/student-panel');
            else navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Kirishda xatolik yuz berdi';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-20">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-indigo-600">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-indigo-100 p-3 rounded-full w-fit mb-4">
                        <LogIn className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl">Tizimga kirish</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={!isStudent}
                                    onChange={() => setIsStudent(false)}
                                    className="w-4 h-4 text-indigo-600"
                                />
                                <span>Admin/O'qituvchi</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={isStudent}
                                    onChange={() => setIsStudent(true)}
                                    className="w-4 h-4 text-indigo-600"
                                />
                                <span>O'quvchi</span>
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Login</label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Parol</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kirish
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
