export async function onRequestGet(context) {
    const db = context.env.MINAV_DB;
    const { results } = await db.prepare('SELECT * FROM friend_links ORDER BY sort_order ASC, created_at ASC').all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}
