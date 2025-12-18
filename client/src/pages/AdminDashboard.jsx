import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/admin';

export default function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ title: '', start_date: '', end_date: '', description: '' });
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) return navigate('/admin/login');
        fetchCourses();
    }, [token]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/courses`, { headers: { Authorization: token } });
            setCourses(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) navigate('/admin/login');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        await axios.post(`${API_URL}/courses`, newCourse, { headers: { Authorization: token } });
        setNewCourse({ title: '', start_date: '', end_date: '', description: '' });
        fetchCourses();
    };

    const handleDelete = async (id) => {
        const password = prompt("請輸入密碼以確認刪除:");
        // Simple verification dialog
        if (!password) return;
        try {
            await axios.post(`${API_URL}/courses/${id}/delete`, { password }, { headers: { Authorization: token } });
            fetchCourses();
        } catch (err) {
            alert('刪除失敗或密碼錯誤');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">課程與資料管理</h1>
                    <Link to="/admin/logs" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">查看訓練紀錄</Link>
                </div>

                {/* Create Course */}
                <div className="bg-white p-6 rounded shadow mb-8">
                    <h3 className="text-xl font-semibold mb-4">建立新課程</h3>
                    <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700">課程名稱</label>
                            <input required type="text" className="w-full p-2 border rounded"
                                value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700">備註說明</label>
                            <input type="text" className="w-full p-2 border rounded" placeholder="選填"
                                value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} />
                        </div>
                        <div className="w-40">
                            <label className="block text-sm font-medium text-gray-700">開始日期</label>
                            <input type="date" className="w-full p-2 border rounded"
                                value={newCourse.start_date} onChange={e => setNewCourse({ ...newCourse, start_date: e.target.value })} />
                        </div>
                        <div className="w-40">
                            <label className="block text-sm font-medium text-gray-700">結束日期</label>
                            <input type="date" className="w-full p-2 border rounded"
                                value={newCourse.end_date} onChange={e => setNewCourse({ ...newCourse, end_date: e.target.value })} />
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-[42px]">新增</button>
                    </form>
                </div>

                {/* List */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">課程名稱</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">有效期間</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{course.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{course.start_date} ~ {course.end_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/course/${course.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">編輯/上傳素材</Link>
                                        <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900">刪除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
