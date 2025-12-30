export async function onRequestGet(context) {
    const { request, env } = context;
    const db = env.MINAV_DB;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    try {
        // 1. Fetch Global Setting
        const settingRes = await db.prepare("SELECT value FROM site_settings WHERE key = 'rss_global_mode'").first();
        const globalMode = settingRes ? settingRes.value : 'local';

        let items = [];
        let totalCount = 0;

        if (globalMode === 'live') {
            // --- Live Mode ---
            // Fetch articles directly from RSS feeds that are enabled for list display

            if (page === 1) {
                const { results: feeds } = await db.prepare(
                    "SELECT * FROM rss_feeds WHERE status = 'active' AND show_in_list = 1"
                ).all();

                if (feeds && feeds.length > 0) {
                    await Promise.all(feeds.map(async (feed) => {
                        try {
                            const response = await fetch(feed.url);
                            if (!response.ok) return;
                            const text = await response.text();

                            const isAtom = text.includes('<entry>');
                            const itemRegex = isAtom ? /<entry>([\s\S]*?)<\/entry>/g : /<item>([\s\S]*?)<\/item>/g;

                            let match;
                            while ((match = itemRegex.exec(text)) !== null) {
                                const entryBlock = match[1];

                                const titleMatch = entryBlock.match(/<title[^>]*>([\s\S]*?)<\/title>/);
                                const linkMatch = isAtom ? entryBlock.match(/<link[^>]+href="([^"]+)"/) : entryBlock.match(/<link>([^<]+)<\/link>/);
                                const guidMatch = entryBlock.match(/<guid[^>]*>([^<]+)<\/guid>/) || entryBlock.match(/<id>([^<]+)<\/id>/);
                                const pubDateMatch = entryBlock.match(/<published>([^<]+)<\/published>/) || entryBlock.match(/<pubDate>([^<]+)<\/pubDate>/) || entryBlock.match(/<updated>([^<]+)<\/updated>/);
                                const contentMatch = entryBlock.match(/<content[^>]*>([\s\S]*?)<\/content>/) || entryBlock.match(/<description>([\s\S]*?)<\/description>/);

                                const clean = (s) => s ? s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : '';

                                const title = clean(titleMatch ? titleMatch[1] : 'Untitled');
                                let link = linkMatch ? (isAtom ? linkMatch[1] : linkMatch[1]) : null;
                                const guid = clean(guidMatch ? guidMatch[1] : link);

                                if (!link && guid && guid.startsWith('http')) {
                                    link = guid;
                                }

                                const pubDateStr = clean(pubDateMatch ? pubDateMatch[1] : '');
                                const published_at = pubDateStr ? new Date(pubDateStr).getTime() : Date.now();
                                const summary = clean(contentMatch ? contentMatch[1] : '').substring(0, 200) + '...';

                                if (title && link) {
                                    items.push({
                                        id: 'live-' + Math.random().toString(36).substr(2, 9),
                                        title,
                                        summary,
                                        original_url: link,
                                        source: feed.name,
                                        published_at,
                                        views: 0,
                                        is_live: true,
                                        cover_image: ''
                                    });
                                }
                            }
                        } catch (e) {
                            console.error(`Live fetch error for ${feed.name}:`, e);
                        }
                    }));
                }
                // Sort live items
                items.sort((a, b) => b.published_at - a.published_at);
                totalCount = items.length;
            }
        } else {
            // --- Local Mode ---
            // Fetch articles from DB for visible feeds only
            // Also need to get total count for pagination

            // Get visible feed IDs
            const { results: visibleFeeds } = await db.prepare("SELECT id FROM rss_feeds WHERE show_in_list = 1").all();
            const visibleFeedIds = visibleFeeds.map(f => f.id);

            if (visibleFeedIds.length > 0) {
                const placeholders = visibleFeedIds.map(() => '?').join(',');
                const whereClause = `status = 'published' AND feed_id IN (${placeholders})`;

                const { results: localItems } = await db.prepare(
                    `SELECT id, title, summary, cover_image, published_at, views, original_url, source 
                     FROM articles 
                     WHERE ${whereClause} 
                     ORDER BY published_at DESC 
                     LIMIT ? OFFSET ?`
                ).bind(...visibleFeedIds, limit, offset).all();

                items = localItems;

                const countRes = await db.prepare(
                    `SELECT COUNT(*) as count FROM articles WHERE ${whereClause}`
                ).bind(...visibleFeedIds).first();
                totalCount = countRes.count;
            } else {
                items = [];
                totalCount = 0;
            }
        }

        return Response.json({
            items: items,
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
