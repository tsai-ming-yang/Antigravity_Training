import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';

export default function CourseList() {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) navigate('/');
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const res = await axios.get(`${API_URL}/public/courses`, { params: { userId } });
        setCourses(res.data);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">可進行的訓練課程</h1>
                    <span className="text-gray-600">ID: {userId}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition ${course.is_completed ? 'border-2 border-green-500 bg-green-50' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold">{course.title}</h2>
                                {course.is_completed && (
                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">已完成</span>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm mb-4">開放時間: {course.start_date} ~ {course.end_date}</p>
                            <Link to={`/training/${course.id}`} className="block w-full bg-indigo-600 text-white text-center py-2 rounded hover:bg-indigo-700">
                                {course.is_completed ? '再次觀看' : '進入課程'}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
