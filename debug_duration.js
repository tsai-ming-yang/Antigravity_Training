const db = require('./server/db');

try {
    const logs = db.prepare(`
        SELECT 
            l.id, l.user_id, l.start_time, l.end_time,
            (strftime('%s', l.end_time) - strftime('%s', l.start_time)) as duration_seconds
        FROM training_logs l
        ORDER BY l.start_time DESC
        LIMIT 5
    `).all();

    console.log('Logs with duration:', logs);
} catch (err) {
    console.error(err);
}
