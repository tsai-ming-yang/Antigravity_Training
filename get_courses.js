const db = require('./server/db');
const courses = db.prepare('SELECT id, title FROM courses').all();
console.log(JSON.stringify(courses));
