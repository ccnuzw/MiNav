export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const categoryId = url.searchParams.get('category_id');
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM items';
    let countQuery = 'SELECT COUNT(*) as total FROM items';

    if (categoryId && categoryId !== 'all') {
        query += ' WHERE category_id = ?';
        countQuery += ' WHERE category_id = ?';
    }

    query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';

    try {
        // 1. Get Total Count
        let total = 0;
        if (categoryId && categoryId !== 'all') {
            const countResult = await db.prepare(countQuery).bind(categoryId).first();
            total = countResult.total;
        } else {
            const countResult = await db.prepare(countQuery).first();
            total = countResult.total;
        }

        // 2. Get Items
        let results;
        if (categoryId && categoryId !== 'all') {
            const stmt = db.prepare(query).bind(categoryId, limit, offset);
            const res = await stmt.all();
            results = res.results;
        } else {
            const stmt = db.prepare(query).bind(limit, offset);
            const res = await stmt.all();
            results = res.results;
        }

        // 3. Get tags for each item
        if (results.length > 0) {
            const itemIds = results.map(item => item.id);
            const placeholders = itemIds.map(() => '?').join(',');

            const { results: tagResults } = await db.prepare(`
                SELECT it.item_id, t.id, t.name, t.color 
                FROM item_tags it 
                JOIN tags t ON it.tag_id = t.id 
                WHERE it.item_id IN (${placeholders})
            `).bind(...itemIds).all();

            // Group tags by item_id
            const tagsByItem = {};
            for (const row of tagResults) {
                if (!tagsByItem[row.item_id]) {
                    tagsByItem[row.item_id] = [];
                }
                tagsByItem[row.item_id].push({ id: row.id, name: row.name, color: row.color });
            }

            // Attach tags to items
            results = results.map(item => ({
                ...item,
                tags: tagsByItem[item.id] || []
            }));
        }

        return new Response(JSON.stringify({ results, total, page, limit }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    const db = context.env.MINAV_DB;
    try {
        const { category_id, name, description, url, icon, status, sort_order, tag_ids } = await context.request.json();

        // 创建项目
        const { success, meta } = await db.prepare(
            `INSERT INTO items (category_id, name, description, url, icon, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(category_id, name, description, url, icon, status || 'active', sort_order || 0).run();

        const itemId = meta.last_row_id;

        // 创建标签关联
        if (tag_ids && tag_ids.length > 0) {
            const insertStmt = db.prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)');
            const batch = tag_ids.map(tagId => insertStmt.bind(itemId, tagId));
            await db.batch(batch);
        }

        return new Response(JSON.stringify({ success, id: itemId }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
