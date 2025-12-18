const db = require('./server/db');

// Insert a test record
const now = new Date();
const past = new Date(now.getTime() - 50000); // 50 seconds ago

const start = past.toISOString();
const end = now.toISOString();

console.log('Start:', start);
console.log('End:', end);

const info = db.prepare('INSERT INTO training_logs (user_id, course_id, start_time, end_time) VALUES (?, ?, ?, ?)').run(
    'test_calc', 999, start, end
);

try {
    const log = db.prepare(`
        SELECT 
            (strftime('%s', end_time) - strftime('%s', start_time)) as duration_seconds
        FROM training_logs 
        WHERE id = ?
    `).get(info.lastInsertRowid);

    console.log('Calculated Duration:', log.duration_seconds);

    // Cleanup
    db.prepare('DELETE FROM training_logs WHERE id = ?').run(info.lastInsertRowid);
} catch (err) {
    console.error(err);
}
