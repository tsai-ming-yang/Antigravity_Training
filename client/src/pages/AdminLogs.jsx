import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:3001/api/admin';

export default function AdminLogs() {
    const [courses, setCourses] = useState([]);
    const [filterCourseId, setFilterCourseId] = useState('');
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) return navigate('/admin/login');
        fetchInitialData();
    }, [token]);

    useEffect(() => {
        if (token) fetchLogs();
    }, [filterCourseId]);

    const fetchInitialData = async () => {
        try {
            const res = await axios.get(`${API_URL}/courses`, { headers: { Authorization: token } });
            setCourses(res.data);
            fetchLogs();
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLogs = async () => {
        try {
            const params = {};
            if (filterCourseId) params.courseId = filterCourseId;
            const res = await axios.get(`${API_URL}/logs`, {
                headers: { Authorization: token },
                params
            });
            setLogs(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) navigate('/admin/login');
        }
    };

    const handleDeleteAll = async () => {
        const password = prompt('請輸入密碼以確認刪除所有紀錄 (此操作無法復原):');
        if (!password) return;

        try {
            await axios.delete(`${API_URL}/logs`, {
                headers: { Authorization: token },
                data: { password }
            });
            alert('所有紀錄已刪除');
            fetchLogs();
        } catch (err) {
            alert('刪除失敗: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleExportExcel = () => {
        if (!logs || logs.length === 0) return alert('無資料可匯出');
        const worksheet = XLSX.utils.json_to_sheet(logs.map(log => ({
            "人員 ID": log.user_id,
            "課程名稱": log.course_title,
            "總時長 (秒)": log.duration_seconds,
            "開始時間": new Date(log.start_time).toLocaleString('zh-TW'),
            "結束時間": new Date(log.end_time).toLocaleString('zh-TW')
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TrainingLogs");
        XLSX.writeFile(workbook, "training_logs.xlsx");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">訓練紀錄查詢</h1>
                    <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600 hover:underline">返回課程管理</button>
                </div>

                <div className="bg-white p-4 rounded shadow mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <label className="font-semibold text-gray-700">依課程篩選:</label>
                        <select
                            className="border rounded p-2"
                            value={filterCourseId}
                            onChange={e => setFilterCourseId(e.target.value)}
                        >
                            <option value="">全部課程</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleDeleteAll}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                    >
                        刪除所有紀錄
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                    >
                        匯出 Excel
                    </button>
                </div>

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">人員 ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">課程名稱</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總時長 (秒)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">開始時間</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">結束時間</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(logs) && logs.length > 0 ? (
                                logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{log.user_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{log.course_title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{log.duration_seconds}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(log.start_time).toLocaleString('zh-TW')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(log.end_time).toLocaleString('zh-TW')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">尚無訓練紀錄</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
