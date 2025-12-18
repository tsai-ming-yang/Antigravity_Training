const db = require('./server/db');

try {
    // 1. Insert Course
    const course = db.prepare('INSERT INTO courses (title, start_date, end_date) VALUES (?, ?, ?)').run(
        '新進員工入職訓練 (Demo)',
        '2024-01-01',
        '2025-12-31'
    );
    const courseId = course.lastInsertRowid;
    console.log(`Created Course: ${courseId}`);

    // 2. Insert Media (Optional, but good for user to see content)
    db.prepare('INSERT INTO media (course_id, filename, original_name, type, duration, display_order) VALUES (?, ?, ?, ?, ?, ?)').run(
        courseId, 'dummy.jpg', 'welcome.jpg', 'image', 5, 0
    );

    // 3. Insert Log
    const start = new Date(Date.now() - 600000).toISOString(); // 10 mins ago
    const end = new Date().toISOString(); // Now

    db.prepare('INSERT INTO training_logs (user_id, course_id, start_time, end_time) VALUES (?, ?, ?, ?)').run(
        'emp_demo', courseId, start, end
    );
    console.log('Created Log for emp_demo');

} catch (err) {
    console.error(err);
}
