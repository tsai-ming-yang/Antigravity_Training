const db = require('./server/db');
try {
    db.prepare('ALTER TABLE courses ADD COLUMN description TEXT').run();
    console.log('Added description column');
} catch (e) {
    if (e.message.includes('duplicate column')) {
        console.log('Column already exists');
    } else {
        console.error(e);
    }
}
