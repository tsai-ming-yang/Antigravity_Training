const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Auth
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '000000') {
        return res.json({ token: 'admin-token', success: true });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Middleware for mock auth
const requireAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === 'Bearer admin-token') return next();
    // For simplicity in development, you might skip strict check or implement real JWT
    // But requirement asks for "Login required"
    if (token === 'admin-token' || token === 'Bearer admin-token') return next();
    res.status(401).json({ error: 'Unauthorized' });
};

const getTodayPassword = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
};

// Course CRUD
router.get('/courses', requireAdmin, (req, res) => {
    const courses = db.prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
    res.json(courses);
});

router.post('/courses', requireAdmin, (req, res) => {
    const { title, start_date, end_date, description } = req.body;
    const info = db.prepare('INSERT INTO courses (title, start_date, end_date, description) VALUES (?, ?, ?, ?)').run(title, start_date, end_date, description);
    res.json({ id: info.lastInsertRowid });
});

router.put('/courses/:id', requireAdmin, (req, res) => {
    const { title, start_date, end_date, description } = req.body;
    db.prepare('UPDATE courses SET title = ?, start_date = ?, end_date = ?, description = ? WHERE id = ?').run(title, start_date, end_date, description, req.params.id);
    res.json({ success: true });
});

router.post('/courses/:id/delete', requireAdmin, (req, res) => {
    // Using POST for delete with body password because DELETE body support varies
    const { password } = req.body;
    if (password !== getTodayPassword()) {
        return res.status(403).json({ error: 'Invalid delete password' });
    }

    // Get media files to delete from FS
    const mediaFiles = db.prepare('SELECT filename FROM media WHERE course_id = ?').all(req.params.id);

    db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);

    // Cleanup files
    mediaFiles.forEach(media => {
        const filePath = path.join(__dirname, '../uploads', media.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.json({ success: true });
});


// Media Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        // Use safe ASCII filename for disk storage to avoid encoding issues
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/courses/:id/media', requireAdmin, (req, res) => {
    const media = db.prepare('SELECT * FROM media WHERE course_id = ? ORDER BY display_order ASC').all(req.params.id);
    res.json(media);
});

router.post('/courses/:id/media', requireAdmin, upload.array('files'), (req, res) => {
    const courseId = req.params.id;
    const files = req.files;

    const insert = db.prepare('INSERT INTO media (course_id, filename, original_name, type, display_order, duration) VALUES (?, ?, ?, ?, ?, ?)');
    const getCount = db.prepare('SELECT COUNT(*) as count FROM media WHERE course_id = ?');

    let currentCount = getCount.get(courseId).count;

    const transaction = db.transaction((files) => {
        for (const file of files) {
            // Fix encoding: Multer often interprets UTF-8 filenames as Latin-1
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

            const type = file.mimetype.startsWith('video') ? 'video' : 'image';
            insert.run(courseId, file.filename, file.originalname, type, currentCount++, 10);
        }
    });

    transaction(files);
    res.json({ success: true });
});

router.put('/media/:id', requireAdmin, (req, res) => {
    const { display_order, duration } = req.body;
    db.prepare('UPDATE media SET display_order = ?, duration = ? WHERE id = ?').run(display_order, duration, req.params.id);
    res.json({ success: true });
});

router.delete('/media/:id', requireAdmin, (req, res) => {
    const media = db.prepare('SELECT filename FROM media WHERE id = ?').get(req.params.id);
    if (media) {
        db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
        const filePath = path.join(__dirname, '../uploads', media.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true });
});

router.get('/logs', requireAdmin, (req, res) => {
    const { courseId } = req.query;
    let query = `
        SELECT 
            l.id, l.user_id, l.start_time, l.end_time,
            c.title as course_title,
            (strftime('%s', l.end_time) - strftime('%s', l.start_time)) as duration_seconds
        FROM training_logs l
        LEFT JOIN courses c ON l.course_id = c.id
    `;

    const params = [];
    if (courseId) {
        query += ' WHERE l.course_id = ?';
        params.push(courseId);
    }

    query += ' ORDER BY l.start_time DESC';

    const logs = db.prepare(query).all(...params);
    res.json(logs);
});

router.delete('/logs', requireAdmin, (req, res) => {
    const { password } = req.body;
    if (password !== getTodayPassword()) {
        return res.status(403).json({ error: 'Invalid delete password' });
    }
    db.prepare('DELETE FROM training_logs').run();
    res.json({ success: true });
});

module.exports = router;
