const db = require('./server/db');
console.log(db.prepare('PRAGMA table_info(courses)').all());
