import { useAuth } from '../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('subjects').then((res) => {
            setSubjects(res.data);
            if (user?.role === 'teacher' && res.data.length > 0) {
                setSelectedSubject(res.data[0].id);
            }
        });
        api.get('students').then((res) => setStudents(res.data));
    }, [user]);

    const handleAttendance = async (studentId, status) => {
        if (!selectedSubject) return alert("Fanni tanlang!");
        try {
            await api.post('attendance', {
                studentId,
                subjectId: selectedSubject,
                date,
                status
            });
            alert(`Davomat saqlandi: ${status}`);
        } catch (error) {
            console.error(error);
            alert("Xatolik!");
        }
    };

    // Filter students by subject would be better, but for now lists all
    // In a real app, backend should filter students enrolled in the subject

    return (
        <div className="max-w-4xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Davomatni Belgilash</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {user?.role === 'admin' ? (
                            <div>
                                <label className="block text-sm font-medium mb-1">Fan</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="">Fanni tanlang</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-end">
                                <p className="text-sm font-medium text-gray-500 mb-1">Dars:</p>
                                <p className="text-lg font-bold text-indigo-700">
                                    {subjects.find(s => s.id === selectedSubject)?.name || 'Yuklanmoqda...'}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-1">Sana</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">O'quvchi</th>
                                    <th className="p-3 text-center">Harakat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="p-3 font-medium">{student.fullName}</td>
                                        <td className="p-3 flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleAttendance(student.id, 'present')}
                                            >
                                                Keldi
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleAttendance(student.id, 'absent')}
                                            >
                                                Kelmadi
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Attendance;
