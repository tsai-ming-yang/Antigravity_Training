const Database = require('better-sqlite3');
const db = new Database('education_training.db', { verbose: console.log });

console.log('--- Current Date Info ---');
const dateInfo = db.prepare("SELECT date('now') as utc, date('now', 'localtime') as local, datetime('now', 'localtime') as local_time").get();
console.log(dateInfo);

console.log('--- Courses ---');
const courses = db.prepare('SELECT id, title, start_date, end_date FROM courses').all();
console.table(courses);

console.log('--- Query Test ---');
const filtered = db.prepare(`
    SELECT * FROM courses 
    WHERE date('now', 'localtime') BETWEEN start_date AND end_date
`).all();
console.table(filtered);
