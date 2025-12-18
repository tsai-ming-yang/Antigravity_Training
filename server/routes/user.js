const express = require('express');
const router = express.Router();
const db = require('../db');

// Get available courses
router.get('/public/courses', (req, res) => {
    const { userId } = req.query;
    // Filter by date: Valid if today is between start_date and end_date (inclusive)
    // Check if logs exist for this user and course
    const courses = db.prepare(`
        SELECT *, 
        EXISTS(SELECT 1 FROM training_logs WHERE user_id = ? AND course_id = courses.id) as is_completed
        FROM courses 
        WHERE date('now', 'localtime') BETWEEN start_date AND end_date 
        ORDER BY start_date DESC
    `).all(userId || null);
    res.json(courses);
});

// Get Media for a course
router.get('/public/courses/:id/media', (req, res) => {
    const media = db.prepare('SELECT * FROM media WHERE course_id = ? ORDER BY display_order ASC').all(req.params.id);
    res.json(media);
});

// Login Check (Just validates ID format, no password)
router.post('/training/login', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
    }
    res.json({ success: true, userId });
});

// Logs
router.post('/logs', (req, res) => {
    const { user_id, course_id, media_id, start_time, end_time } = req.body;

    // Add validation if needed

    db.prepare('INSERT INTO training_logs (user_id, course_id, media_id, start_time, end_time) VALUES (?, ?, ?, ?, ?)').run(
        user_id, course_id, media_id, start_time, end_time
    );

    res.json({ success: true });
});

module.exports = router;
