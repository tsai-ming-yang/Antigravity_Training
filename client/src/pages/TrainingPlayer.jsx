import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api';
const UPLOAD_URL = 'http://localhost:3001/uploads';

export default function TrainingPlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [mediaList, setMediaList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [canAdvance, setCanAdvance] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        if (!userId) navigate('/');
        fetchMedia();
        return () => clearTimeout(timerRef.current);
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await axios.get(`${API_URL}/public/courses/${courseId}/media`);
            if (res.data.length > 0) {
                setMediaList(res.data);
                setLoading(false);
                // Set start time only once when content is loaded
                if (!startTime) setStartTime(new Date().toISOString());
            } else {
                alert('本課程尚無內容');
                navigate('/courses');
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (loading || completed) return;

        setCanAdvance(false); // Reset enable state
        const currentMedia = mediaList[currentIndex];
        const durationMs = currentMedia.duration * 1000;

        // Set timer to enable next button
        timerRef.current = setTimeout(() => {
            setCanAdvance(true);
        }, durationMs);

        return () => clearTimeout(timerRef.current);
    }, [currentIndex, loading, completed]);

    const handleNext = async () => {
        if (!canAdvance) return;

        if (currentIndex + 1 < mediaList.length) {
            setCurrentIndex(prev => prev + 1);
            setCanAdvance(false);
        } else {
            // Log completion here
            const endTime = new Date().toISOString();
            try {
                await axios.post(`${API_URL}/logs`, {
                    user_id: userId,
                    course_id: courseId,
                    media_id: null, // Course level log
                    start_time: startTime,
                    end_time: endTime
                });
            } catch (e) {
                console.error('Log failed', e);
            }
            setCompleted(true);
        }
    };

    if (loading) return <div className="text-center mt-20">載入中...</div>;

    if (completed) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-green-50">
                <h1 className="text-4xl font-bold text-green-700 mb-4">訓練完成！</h1>
                <p className="text-gray-600 mb-8">您的訓練紀錄已保存。</p>
                <button onClick={() => navigate('/courses')} className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg">
                    返回課程列表
                </button>
            </div>
        );
    }

    const currentMedia = mediaList[currentIndex];

    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center relative">
            {/* Progress Info */}
            <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded z-10">
                第 {currentIndex + 1} 頁 / 共 {mediaList.length} 頁
            </div>

            {/* Content */}
            {currentMedia.type === 'image' ? (
                <img
                    src={`${UPLOAD_URL}/${currentMedia.filename}`}
                    className="max-h-screen max-w-full object-contain"
                    alt="投影片"
                />
            ) : (
                <video
                    src={`${UPLOAD_URL}/${currentMedia.filename}`}
                    className="max-h-screen max-w-full"
                    autoPlay
                    // muted // Re-enable muted if interaction issues occur, but assume user interaction (login) allows audio
                    controls={false}
                    playsInline
                />
            )}

            {/* Timer Bar (Visual Feedback) */}
            {!canAdvance && (
                <div key={currentIndex} className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all duration-linear"
                    style={{ transitionDuration: `${currentMedia.duration}s`, width: '100%' }}>
                </div>
            )}

            {/* Next Button */}
            {canAdvance && (
                <div className="absolute bottom-10 right-10 z-20">
                    <button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg animate-bounce"
                    >
                        下一頁 &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
