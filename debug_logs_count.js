const db = require('./server/db');
const logs = db.prepare('SELECT count(*) as count FROM training_logs').get();
console.log('Log count:', logs.count);
const allLogs = db.prepare('SELECT * FROM training_logs_LIMIT 5').all(); // Typo intention to fail? No, just SELECT * FROM training_logs LIMIT 5
console.log('Sample logs:', db.prepare('SELECT * FROM training_logs LIMIT 5').all());
