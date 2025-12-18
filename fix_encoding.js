const db = require('./server/db');

try {
    const mediaList = db.prepare('SELECT id, original_name FROM media').all();
    const update = db.prepare('UPDATE media SET original_name = ? WHERE id = ?');

    let count = 0;
    db.transaction(() => {
        for (const media of mediaList) {
            try {
                // Check if it looks like mojibake (Latin-1 interpreted UTF-8)
                const fixed = Buffer.from(media.original_name, 'latin1').toString('utf8');

                // Simple heuristic: if the string became shorter or changed significantly and looks valid
                if (fixed !== media.original_name) {
                    console.log(`Fixing: ${media.original_name} -> ${fixed}`);
                    update.run(fixed, media.id);
                    count++;
                }
            } catch (e) {
                console.warn(`Could not fix id ${media.id}: ${media.original_name}`);
            }
        }
    })();
    console.log(`Fixed ${count} records.`);
} catch (err) {
    console.error(err);
}
