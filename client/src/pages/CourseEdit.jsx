import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/admin';
const UPLOAD_URL = 'http://localhost:3001/uploads';

export default function CourseEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');
    const [course, setCourse] = useState({ title: '', start_date: '', end_date: '', description: '' });
    const [mediaList, setMediaList] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!token) return navigate('/admin/login');
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch details (reuse courses list endpoint or add specific one, here reusing list and finding)
            const coursesRes = await axios.get(`${API_URL}/courses`, { headers: { Authorization: token } });
            const c = coursesRes.data.find(c => c.id == id);
            if (c) setCourse(c);

            const mediaRes = await axios.get(`${API_URL}/courses/${id}/media`, { headers: { Authorization: token } });
            setMediaList(mediaRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        await axios.put(`${API_URL}/courses/${id}`, course, { headers: { Authorization: token } });
        alert('課程已更新');
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        setUploading(true);
        try {
            await axios.post(`${API_URL}/courses/${id}/media`, formData, {
                headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
            });
            await fetchData();
        } catch (err) {
            alert('上傳失敗');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveMedia = async (mediaId, data) => {
        try {
            await axios.put(`${API_URL}/media/${mediaId}`, data, { headers: { Authorization: token } });
            // Optional: show visual feedback
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMedia = async (mediaId) => {
        if (!confirm('確定要刪除此素材嗎?')) return;
        await axios.delete(`${API_URL}/media/${mediaId}`, { headers: { Authorization: token } });
        fetchData();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold mb-6">編輯課程: {course.title}</h1>

                {/* Course Details */}
                <form onSubmit={handleUpdateCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 border-b pb-8">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700">課程名稱</label>
                        <input type="text" className="w-full p-2 border rounded" required
                            value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700">開始日期</label>
                        <input type="date" className="w-full p-2 border rounded"
                            value={course.start_date} onChange={e => setCourse({ ...course, start_date: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700">結束日期</label>
                        <input type="date" className="w-full p-2 border rounded"
                            value={course.end_date} onChange={e => setCourse({ ...course, end_date: e.target.value })} />
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-sm text-gray-700">備註說明</label>
                        <textarea className="w-full p-2 border rounded" rows="2" placeholder="選填"
                            value={course.description || ''}
                            onChange={e => setCourse({ ...course, description: e.target.value })} />
                    </div>
                    <div className="flex items-end">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">儲存設定</button>
                    </div>
                </form>

                {/* Upload */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">上傳素材</h3>
                    <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded bg-gray-50">
                        <input type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" id="fileUpload" />
                        <label htmlFor="fileUpload" className="cursor-pointer text-blue-600 hover:underline text-lg">
                            {uploading ? '上傳中...' : '點擊選擇檔案 (圖片/影片)'}
                        </label>
                        <p className="text-gray-500 text-sm mt-2">支援 JPG, PNG, HTML5 Video (MP4)</p>
                    </div>
                </div>

                {/* Media List */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">課程素材 ({mediaList.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預覽</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">檔案名稱</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順序</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">停留時間 (秒)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {mediaList.map((m, idx) => (
                                    <tr key={m.id}>
                                        <td className="px-4 py-2 w-32 text-center align-middle">
                                            {m.type === 'image' ? (
                                                <img src={`${UPLOAD_URL}/${m.filename}`} className="h-16 w-16 object-cover rounded mx-auto" />
                                            ) : (
                                                <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">影片</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                                            {m.original_name}
                                        </td>
                                        <td className="px-4 py-2 text-center align-middle">
                                            <input type="number" className="w-20 p-1 border rounded text-center"
                                                defaultValue={m.display_order}
                                                onBlur={(e) => handleSaveMedia(m.id, { ...m, display_order: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center align-middle">
                                            <input type="number" className="w-20 p-1 border rounded text-center"
                                                defaultValue={m.duration}
                                                onBlur={(e) => handleSaveMedia(m.id, { ...m, duration: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-center align-middle">
                                            <button onClick={() => handleDeleteMedia(m.id)} className="text-red-500 hover:text-red-700">刪除</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
