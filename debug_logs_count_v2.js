const db = require('./server/db');
try {
    const count = db.prepare('SELECT count(*) as count FROM training_logs').get();
    console.log('Log count:', count.count);

    if (count.count > 0) {
        const logs = db.prepare('SELECT * FROM training_logs LIMIT 5').all();
        console.log('Sample logs:', logs);
    }
} catch (e) {
    console.error(e);
}
