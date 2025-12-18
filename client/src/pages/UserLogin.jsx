import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

export default function UserLogin() {
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    const handleStart = async (e) => {
        e.preventDefault();
        if (!userId.trim()) return;
        try {
            await axios.post(`${API_URL}/training/login`, { userId }); // Optional: Just to validate format
            localStorage.setItem('userId', userId);
            navigate('/courses');
        } catch (err) {
            alert('無效的ID');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
            <h1 className="text-4xl font-bold mb-8 text-blue-900">教育訓練入口</h1>
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <label className="block text-gray-700 font-semibold mb-2">請輸入您的員工編號 (Personnel ID)</label>
                <form onSubmit={handleStart}>
                    <input
                        type="text"
                        className="w-full p-4 border-2 border-blue-200 rounded-lg text-lg mb-4 focus:border-blue-500 outline-none transition"
                        placeholder="例如：EMP-123456"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                        開始訓練
                    </button>
                </form>
            </div>
        </div>
    );
}
