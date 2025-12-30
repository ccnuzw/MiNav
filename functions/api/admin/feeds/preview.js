export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.MINAV_DB;

    try {
        const { ids } = await request.json();

        let query = "SELECT * FROM rss_feeds WHERE status = 'active'";
        let params = [];

        if (ids && Array.isArray(ids) && ids.length > 0) {
            query += ` AND id IN (${ids.map(() => '?').join(',')})`;
            params = ids;
        }

        const { results: feeds } = await db.prepare(query).bind(...params).all();

        if (!feeds || feeds.length === 0) {
            return Response.json({ items: [] });
        }

        let allItems = [];

        // Fetch and parse all
        await Promise.all(feeds.map(async (feed) => {
            try {
                const response = await fetch(feed.url);
                if (!response.ok) return;
                const text = await response.text();

                // Simple XML Parse (Same logic as sync.js)
                const isAtom = text.includes('<entry>');
                const itemRegex = isAtom ? /<entry>([\s\S]*?)<\/entry>/g : /<item>([\s\S]*?)<\/item>/g;

                let match;
                while ((match = itemRegex.exec(text)) !== null) {
                    const entryBlock = match[1];

                    const titleMatch = entryBlock.match(/<title[^>]*>([\s\S]*?)<\/title>/);
                    const linkMatch = isAtom ? entryBlock.match(/<link[^>]+href="([^"]+)"/) : entryBlock.match(/<link>([^<]+)<\/link>/);
                    const pubDateMatch = entryBlock.match(/<published>([^<]+)<\/published>/) || entryBlock.match(/<pubDate>([^<]+)<\/pubDate>/) || entryBlock.match(/<updated>([^<]+)<\/updated>/);

                    const clean = (s) => s ? s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : '';

                    const title = clean(titleMatch ? titleMatch[1] : 'Untitled');
                    const link = linkMatch ? (isAtom ? linkMatch[1] : linkMatch[1]) : null;
                    const pubDateStr = clean(pubDateMatch ? pubDateMatch[1] : '');
                    const pubDate = pubDateStr ? new Date(pubDateStr).getTime() : Date.now();

                    if (title && link) {
                        allItems.push({
                            title,
                            link,
                            pubDate,
                            feedName: feed.name,
                            feedId: feed.id
                        });
                    }
                }
            } catch (e) {
                console.error(`Preview fetch error for ${feed.name}:`, e);
            }
        }));

        // Sort by date desc
        allItems.sort((a, b) => b.pubDate - a.pubDate);

        return Response.json({ items: allItems });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
