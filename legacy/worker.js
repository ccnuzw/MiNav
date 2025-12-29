/**
 * 备用随机 SVG 图标 - 优化设计
 */
export const fallbackSVGIcons = [
    `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient1)" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stop-color="#7209b7" />
         <stop offset="100%" stop-color="#4cc9f0" />
       </linearGradient>
     </defs>
     <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
   </svg>`,
    `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient2)" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stop-color="#4361ee" />
         <stop offset="100%" stop-color="#4cc9f0" />
       </linearGradient>
     </defs>
     <circle cx="12" cy="12" r="10"/>
     <path d="M12 7v5l3.5 3.5 1.42-1.42L14 11.58V7h-2z" fill="#fff"/>
   </svg>`,
    `<svg width="80" height="80" viewBox="0 0 24 24" fill="url(#gradient3)" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
         <stop offset="0%" stop-color="#7209b7" />
         <stop offset="100%" stop-color="#4361ee" />
       </linearGradient>
     </defs>
     <path d="M12 .587l3.668 7.431L24 9.172l-6 5.843 1.416 8.252L12 19.771l-7.416 3.496L6 15.015 0 9.172l8.332-1.154z"/>
   </svg>`,
];



function getRandomSVG() {
    return fallbackSVGIcons[Math.floor(Math.random() * fallbackSVGIcons.length)];
}

/**
 * 渲染单个网站卡片（优化版）
 */
function renderSiteCard(site) {
    const safeName = escapeHTML(site.name || '未命名');
    const safeUrl = site.url ? escapeHTML(site.url) : '#';
    const safeLogo = site.logo ? escapeHTML(site.logo) : '';
    const safeDesc = escapeHTML(site.desc || '暂无描述');
    const safeCatalog = escapeHTML(site.catelog || '');

    const logoHtml = safeLogo
        ? `<img src="${safeLogo}" alt="${safeName}" class="w-full h-full object-cover">`
        : `<i class="fas fa-globe text-2xl text-white"></i>`;

    const logoContainer = safeLogo
        ? `<div class="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
             ${logoHtml}
           </div>`
        : `<div class="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
             ${logoHtml}
           </div>`;

    return `
    <div class="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-lg transition duration-300 flex flex-col group relative">
        <div class="flex items-start space-x-4 mb-4">
            ${logoContainer}
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 dark:text-white text-lg truncate" title="${safeName}">${safeName}</h3>
                 <span class="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    ${safeCatalog}
                 </span>
            </div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-6 h-20 overflow-hidden text-ellipsis line-clamp-3" title="${safeDesc}">
            ${safeDesc}
        </p>
        <div class="flex flex-wrap gap-2 mt-auto">
             <a href="${safeUrl}" target="_blank" class="px-3 py-1 bg-primary text-white text-xs rounded-md hover:bg-primary-hover transition">
                访问
            </a>
            <button class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition copy-btn" data-url="${safeUrl}">
                复制
            </button>
        </div>
    </div>`;
}

function escapeHTML(input) {
    if (input === null || input === undefined) {
        return '';
    }
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
    if (!url) {
        return '';
    }
    const trimmed = String(url).trim();
    try {
        const direct = new URL(trimmed);
        if (direct.protocol === 'http:' || direct.protocol === 'https:') {
            return direct.href;
        }
    } catch (error) {
        try {
            const fallback = new URL(`https://${trimmed}`);
            if (fallback.protocol === 'http:' || fallback.protocol === 'https:') {
                return fallback.href;
            }
        } catch (e) {
            return '';
        }
    }
    return '';
}

function normalizeSortOrder(value) {
    if (value === undefined || value === null || value === '') {
        return 9999;
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        const clamped = Math.max(-2147483648, Math.min(2147483647, Math.round(parsed)));
        return clamped;
    }
    return 9999;
}

function isSubmissionEnabled(env) {
    const flag = env.ENABLE_PUBLIC_SUBMISSION;
    if (flag === undefined || flag === null) {
        return true;
    }
    const normalized = String(flag).trim().toLowerCase();
    return normalized === 'true';
}

const SESSION_COOKIE_NAME = 'nav_admin_session';
const SESSION_PREFIX = 'session:';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12小时会话

function parseCookies(cookieHeader = '') {
    return cookieHeader
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
        .reduce((acc, pair) => {
            const separatorIndex = pair.indexOf('=');
            if (separatorIndex === -1) {
                acc[pair] = '';
            } else {
                const key = pair.slice(0, separatorIndex).trim();
                const value = pair.slice(separatorIndex + 1).trim();
                acc[key] = value;
            }
            return acc;
        }, {});
}

function buildSessionCookie(token, options = {}) {
    const { maxAge = SESSION_TTL_SECONDS } = options;
    const segments = [
        `${SESSION_COOKIE_NAME}=${token}`,
        'Path=/',
        `Max-Age=${maxAge}`,
        'HttpOnly',
        'SameSite=Strict',
        'Secure',
    ];
    return segments.join('; ');
}

async function createAdminSession(env) {
    const token = crypto.randomUUID();
    await env.NAV_AUTH.put(`${SESSION_PREFIX}${token}`, JSON.stringify({ createdAt: Date.now() }), {
        expirationTtl: SESSION_TTL_SECONDS,
    });
    return token;
}

async function refreshAdminSession(env, token, payload) {
    await env.NAV_AUTH.put(`${SESSION_PREFIX}${token}`, payload, { expirationTtl: SESSION_TTL_SECONDS });
}

async function destroyAdminSession(env, token) {
    if (!token) return;
    await env.NAV_AUTH.delete(`${SESSION_PREFIX}${token}`);
}

async function validateAdminSession(request, env) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
        return { authenticated: false };
    }
    const sessionKey = `${SESSION_PREFIX}${token}`;
    const payload = await env.NAV_AUTH.get(sessionKey);
    if (!payload) {
        return { authenticated: false };
    }
    // 会话有效，刷新TTL
    await refreshAdminSession(env, token, payload);
    return { authenticated: true, token };
}

async function isAdminAuthenticated(request, env) {
    const { authenticated } = await validateAdminSession(request, env);
    return authenticated;
}


/**
 * 处理 API 请求
 */
const api = {
    async handleRequest(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname.replace('/api', ''); // 去掉 "/api" 前缀
        const method = request.method;
        const id = url.pathname.split('/').pop(); // 获取最后一个路径段，作为 id (例如 /api/config/1)
        try {
            if (path === '/config') {
                switch (method) {
                    case 'GET':
                        return await this.getConfig(request, env, ctx, url);
                    case 'POST':
                        if (!(await isAdminAuthenticated(request, env))) {
                            return this.errorResponse('Unauthorized', 401);
                        }
                        return await this.createConfig(request, env, ctx);
                    default:
                        return this.errorResponse('Method Not Allowed', 405)
                }
            }
            if (path === '/config/submit' && method === 'POST') {
                if (!isSubmissionEnabled(env)) {
                    return this.errorResponse('Public submission disabled', 403);
                }
                return await this.submitConfig(request, env, ctx);
            }
            if (path === '/categories' && method === 'GET') {
                if (!(await isAdminAuthenticated(request, env))) {
                    return this.errorResponse('Unauthorized', 401);
                }
                return await this.getCategories(request, env, ctx);
            }
            if (path.startsWith('/categories/')) {
                if (!(await isAdminAuthenticated(request, env))) {
                    return this.errorResponse('Unauthorized', 401);
                }
                const categoryName = decodeURIComponent(path.replace('/categories/', ''));
                switch (method) {
                    case 'PUT':
                        return await this.updateCategoryOrder(request, env, ctx, categoryName);
                    default:
                        return this.errorResponse('Method Not Allowed', 405);
                }
            }
            if (path === `/config/${id}` && /^\d+$/.test(id)) {
                switch (method) {
                    case 'PUT':
                        if (!(await isAdminAuthenticated(request, env))) {
                            return this.errorResponse('Unauthorized', 401);
                        }
                        return await this.updateConfig(request, env, ctx, id);
                    case 'DELETE':
                        if (!(await isAdminAuthenticated(request, env))) {
                            return this.errorResponse('Unauthorized', 401);
                        }
                        return await this.deleteConfig(request, env, ctx, id);
                    default:
                        return this.errorResponse('Method Not Allowed', 405)
                }
            }
            if (path.startsWith('/pending/') && /^\d+$/.test(id)) {
                switch (method) {
                    case 'PUT':
                        if (!(await isAdminAuthenticated(request, env))) {
                            return this.errorResponse('Unauthorized', 401);
                        }
                        return await this.approvePendingConfig(request, env, ctx, id);
                    case 'DELETE':
                        if (!(await isAdminAuthenticated(request, env))) {
                            return this.errorResponse('Unauthorized', 401);
                        }
                        return await this.rejectPendingConfig(request, env, ctx, id);
                    default:
                        return this.errorResponse('Method Not Allowed', 405)
                }
            }
            if (path === '/config/import' && method === 'POST') {
                if (!(await isAdminAuthenticated(request, env))) {
                    return this.errorResponse('Unauthorized', 401);
                }
                return await this.importConfig(request, env, ctx);
            }
            if (path === '/config/export' && method === 'GET') {
                if (!(await isAdminAuthenticated(request, env))) {
                    return this.errorResponse('Unauthorized', 401);
                }
                return await this.exportConfig(request, env, ctx);
            }
            if (path === '/pending' && method === 'GET') {
                if (!(await isAdminAuthenticated(request, env))) {
                    return this.errorResponse('Unauthorized', 401);
                }
                return await this.getPendingConfig(request, env, ctx, url);
            }
            return this.errorResponse('Not Found', 404);
        } catch (error) {
            return this.errorResponse(`Internal Server Error: ${error.message}`, 500);
        }
    },
    async getConfig(request, env, ctx, url) {
        const catalog = url.searchParams.get('catalog');
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
        const keyword = url.searchParams.get('keyword');
        const offset = (page - 1) * pageSize;
        try {
            //- [优化] 调整了SQL查询语句，增加了 sort_order 排序
            let query = `SELECT * FROM sites ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
            let countQuery = `SELECT COUNT(*) as total FROM sites`;
            let queryBindParams = [pageSize, offset];
            let countQueryParams = [];

            if (catalog) {
                query = `SELECT * FROM sites WHERE catelog = ? ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                countQuery = `SELECT COUNT(*) as total FROM sites WHERE catelog = ?`
                queryBindParams = [catalog, pageSize, offset];
                countQueryParams = [catalog];
            }

            if (keyword) {
                const likeKeyword = `%${keyword}%`;
                query = `SELECT * FROM sites WHERE name LIKE ? OR url LIKE ? OR catelog LIKE ? ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                countQuery = `SELECT COUNT(*) as total FROM sites WHERE name LIKE ? OR url LIKE ? OR catelog LIKE ?`;
                queryBindParams = [likeKeyword, likeKeyword, likeKeyword, pageSize, offset];
                countQueryParams = [likeKeyword, likeKeyword, likeKeyword];

                if (catalog) {
                    query = `SELECT * FROM sites WHERE catelog = ? AND (name LIKE ? OR url LIKE ? OR catelog LIKE ?) ORDER BY sort_order ASC, create_time DESC LIMIT ? OFFSET ?`;
                    countQuery = `SELECT COUNT(*) as total FROM sites WHERE catelog = ? AND (name LIKE ? OR url LIKE ? OR catelog LIKE ?)`;
                    queryBindParams = [catalog, likeKeyword, likeKeyword, likeKeyword, pageSize, offset];
                    countQueryParams = [catalog, likeKeyword, likeKeyword, likeKeyword];
                }
            }

            const { results } = await env.NAV_DB.prepare(query).bind(...queryBindParams).all();
            const countResult = await env.NAV_DB.prepare(countQuery).bind(...countQueryParams).first();
            const total = countResult ? countResult.total : 0;

            return new Response(
                JSON.stringify({
                    code: 200,
                    data: results,
                    total,
                    page,
                    pageSize
                }),
                { headers: { 'Content-Type': 'application/json' } }
            );

        } catch (e) {
            return this.errorResponse(`Failed to fetch config data: ${e.message}`, 500)
        }
    },
    async getPendingConfig(request, env, ctx, url) {
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
        const offset = (page - 1) * pageSize;
        try {
            const { results } = await env.NAV_DB.prepare(`
                        SELECT * FROM pending_sites ORDER BY create_time DESC LIMIT ? OFFSET ?
                    `).bind(pageSize, offset).all();
            const countResult = await env.NAV_DB.prepare(`
                      SELECT COUNT(*) as total FROM pending_sites
                      `).first();
            const total = countResult ? countResult.total : 0;
            return new Response(
                JSON.stringify({
                    code: 200,
                    data: results,
                    total,
                    page,
                    pageSize
                }),
                { headers: { 'Content-Type': 'application/json' } }
            );
        } catch (e) {
            return this.errorResponse(`Failed to fetch pending config data: ${e.message}`, 500);
        }
    },
    async approvePendingConfig(request, env, ctx, id) {
        try {
            const { results } = await env.NAV_DB.prepare('SELECT * FROM pending_sites WHERE id = ?').bind(id).all();
            if (results.length === 0) {
                return this.errorResponse('Pending config not found', 404);
            }
            const config = results[0];
            //- [优化] 批准时，插入的数据也包含了 sort_order 的默认值
            await env.NAV_DB.prepare(`
                    INSERT INTO sites (name, url, logo, desc, catelog, sort_order)
                    VALUES (?, ?, ?, ?, ?, 9999) 
              `).bind(config.name, config.url, config.logo, config.desc, config.catelog).run();
            await env.NAV_DB.prepare('DELETE FROM pending_sites WHERE id = ?').bind(id).run();

            return new Response(JSON.stringify({
                code: 200,
                message: 'Pending config approved successfully'
            }), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (e) {
            return this.errorResponse(`Failed to approve pending config : ${e.message}`, 500);
        }
    },
    async rejectPendingConfig(request, env, ctx, id) {
        try {
            await env.NAV_DB.prepare('DELETE FROM pending_sites WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({
                code: 200,
                message: 'Pending config rejected successfully',
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return this.errorResponse(`Failed to reject pending config: ${e.message}`, 500);
        }
    },
    async submitConfig(request, env, ctx) {
        try {
            if (!isSubmissionEnabled(env)) {
                return this.errorResponse('Public submission disabled', 403);
            }
            const config = await request.json();
            const { name, url, logo, desc, catelog } = config;
            const sanitizedName = (name || '').trim();
            const sanitizedUrl = (url || '').trim();
            const sanitizedCatelog = (catelog || '').trim();
            const sanitizedLogo = (logo || '').trim() || null;
            const sanitizedDesc = (desc || '').trim() || null;

            if (!sanitizedName || !sanitizedUrl || !sanitizedCatelog) {
                return this.errorResponse('Name, URL and Catelog are required', 400);
            }
            await env.NAV_DB.prepare(`
                  INSERT INTO pending_sites (name, url, logo, desc, catelog)
                  VALUES (?, ?, ?, ?, ?)
            `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog).run();

            return new Response(JSON.stringify({
                code: 201,
                message: 'Config submitted successfully, waiting for admin approve',
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            })
        } catch (e) {
            return this.errorResponse(`Failed to submit config : ${e.message}`, 500);
        }
    },


    async createConfig(request, env, ctx) {
        try {
            const config = await request.json();
            //- [新增] 从请求体中获取 sort_order
            const { name, url, logo, desc, catelog, sort_order } = config;
            const sanitizedName = (name || '').trim();
            const sanitizedUrl = (url || '').trim();
            const sanitizedCatelog = (catelog || '').trim();
            const sanitizedLogo = (logo || '').trim() || null;
            const sanitizedDesc = (desc || '').trim() || null;
            const sortOrderValue = normalizeSortOrder(sort_order);

            if (!sanitizedName || !sanitizedUrl || !sanitizedCatelog) {
                return this.errorResponse('Name, URL and Catelog are required', 400);
            }
            //- [优化] INSERT 语句增加了 sort_order 字段
            const insert = await env.NAV_DB.prepare(`
                    INSERT INTO sites (name, url, logo, desc, catelog, sort_order)
                    VALUES (?, ?, ?, ?, ?, ?)
              `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog, sortOrderValue).run(); // 如果sort_order未提供，则默认为9999

            return new Response(JSON.stringify({
                code: 201,
                message: 'Config created successfully',
                insert
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            })
        } catch (e) {
            return this.errorResponse(`Failed to create config : ${e.message}`, 500);
        }
    },


    async updateConfig(request, env, ctx, id) {
        try {
            const config = await request.json();
            //- [新增] 从请求体中获取 sort_order
            const { name, url, logo, desc, catelog, sort_order } = config;
            const sanitizedName = (name || '').trim();
            const sanitizedUrl = (url || '').trim();
            const sanitizedCatelog = (catelog || '').trim();
            const sanitizedLogo = (logo || '').trim() || null;
            const sanitizedDesc = (desc || '').trim() || null;
            const sortOrderValue = normalizeSortOrder(sort_order);

            if (!sanitizedName || !sanitizedUrl || !sanitizedCatelog) {
                return this.errorResponse('Name, URL and Catelog are required', 400);
            }
            //- [优化] UPDATE 语句增加了 sort_order 字段
            const update = await env.NAV_DB.prepare(`
                UPDATE sites
                SET name = ?, url = ?, logo = ?, desc = ?, catelog = ?, sort_order = ?, update_time = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog, sortOrderValue, id).run();
            return new Response(JSON.stringify({
                code: 200,
                message: 'Config updated successfully',
                update
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return this.errorResponse(`Failed to update config: ${e.message}`, 500);
        }
    },

    async deleteConfig(request, env, ctx, id) {
        try {
            const del = await env.NAV_DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({
                code: 200,
                message: 'Config deleted successfully',
                del
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return this.errorResponse(`Failed to delete config: ${e.message}`, 500);
        }
    },
    async importConfig(request, env, ctx) {
        try {
            const jsonData = await request.json();
            let sitesToImport = [];

            // [优化] 智能判断导入的JSON文件格式
            // 1. 如果 jsonData 本身就是数组 (新的、正确的导出格式)
            if (Array.isArray(jsonData)) {
                sitesToImport = jsonData;
            }
            // 2. 如果 jsonData 是一个对象，且包含一个名为 'data' 的数组 (兼容旧的导出格式)
            else if (jsonData && typeof jsonData === 'object' && Array.isArray(jsonData.data)) {
                sitesToImport = jsonData.data;
            }
            // 3. 如果两种都不是，则格式无效
            else {
                return this.errorResponse('Invalid JSON data. Must be an array of site configurations, or an object with a "data" key containing the array.', 400);
            }

            if (sitesToImport.length === 0) {
                return new Response(JSON.stringify({
                    code: 200,
                    message: 'Import successful, but no data was found in the file.'
                }), { headers: { 'Content-Type': 'application/json' } });
            }

            const insertStatements = sitesToImport.map(item => {
                const sanitizedName = (item.name || '').trim() || null;
                const sanitizedUrl = (item.url || '').trim() || null;
                const sanitizedLogo = (item.logo || '').trim() || null;
                const sanitizedDesc = (item.desc || '').trim() || null;
                const sanitizedCatelog = (item.catelog || '').trim() || null;
                const sortOrderValue = normalizeSortOrder(item.sort_order);
                return env.NAV_DB.prepare(`
                        INSERT INTO sites (name, url, logo, desc, catelog, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?)
                  `).bind(sanitizedName, sanitizedUrl, sanitizedLogo, sanitizedDesc, sanitizedCatelog, sortOrderValue);
            })

            // 使用 D1 的 batch 操作，效率更高
            await env.NAV_DB.batch(insertStatements);

            return new Response(JSON.stringify({
                code: 201,
                message: `Config imported successfully. ${sitesToImport.length} items added.`
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return this.errorResponse(`Failed to import config : ${error.message}`, 500);
        }
    },

    async exportConfig(request, env, ctx) {
        try {
            // [优化] 导出的数据将不再被包裹在 {code, data} 对象中
            const { results } = await env.NAV_DB.prepare('SELECT * FROM sites ORDER BY sort_order ASC, create_time DESC').all();

            // JSON.stringify 的第二和第三个参数用于“美化”输出的JSON，
            // null 表示不替换任何值，2 表示使用2个空格进行缩进。
            // 这使得导出的文件非常易于阅读和手动编辑。
            const pureJsonData = JSON.stringify(results, null, 2);

            return new Response(pureJsonData, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    // 确保浏览器将其作为文件下载
                    'Content-Disposition': 'attachment; filename="config.json"'
                }
            });
        } catch (e) {
            return this.errorResponse(`Failed to export config: ${e.message}`, 500)
        }
    },
    async getCategories(request, env, ctx) {
        try {
            const categoryOrderMap = new Map();
            try {
                const { results: orderRows } = await env.NAV_DB.prepare('SELECT catelog, sort_order FROM category_orders').all();
                orderRows.forEach(row => {
                    categoryOrderMap.set(row.catelog, normalizeSortOrder(row.sort_order));
                });
            } catch (error) {
                if (!/no such table/i.test(error.message || '')) {
                    throw error;
                }
            }

            const { results } = await env.NAV_DB.prepare(`
                SELECT catelog, COUNT(*) AS site_count, MIN(sort_order) AS min_site_sort
                FROM sites
                GROUP BY catelog
              `).all();

            const data = results.map(row => ({
                catelog: row.catelog,
                site_count: row.site_count,
                sort_order: categoryOrderMap.has(row.catelog)
                    ? categoryOrderMap.get(row.catelog)
                    : normalizeSortOrder(row.min_site_sort),
                explicit: categoryOrderMap.has(row.catelog),
                min_site_sort: row.min_site_sort === null ? 9999 : normalizeSortOrder(row.min_site_sort)
            }));

            data.sort((a, b) => {
                if (a.sort_order !== b.sort_order) {
                    return a.sort_order - b.sort_order;
                }
                if (a.min_site_sort !== b.min_site_sort) {
                    return a.min_site_sort - b.min_site_sort;
                }
                return a.catelog.localeCompare(b.catelog, 'zh-Hans-CN', { sensitivity: 'base' });
            });

            return new Response(JSON.stringify({
                code: 200,
                data
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return this.errorResponse(`Failed to fetch categories: ${e.message}`, 500);
        }
    },
    async updateCategoryOrder(request, env, ctx, categoryName) {
        try {
            const body = await request.json();
            if (!categoryName) {
                return this.errorResponse('Category name is required', 400);
            }

            const normalizedCategory = categoryName.trim();
            if (!normalizedCategory) {
                return this.errorResponse('Category name is required', 400);
            }

            if (body && body.reset) {
                await env.NAV_DB.prepare('DELETE FROM category_orders WHERE catelog = ?')
                    .bind(normalizedCategory)
                    .run();
                return new Response(JSON.stringify({
                    code: 200,
                    message: 'Category order reset successfully'
                }), { headers: { 'Content-Type': 'application/json' } });
            }

            const sortOrderValue = normalizeSortOrder(body ? body.sort_order : undefined);
            await env.NAV_DB.prepare(`
                INSERT INTO category_orders (catelog, sort_order)
                VALUES (?, ?)
                ON CONFLICT(catelog) DO UPDATE SET sort_order = excluded.sort_order
              `).bind(normalizedCategory, sortOrderValue).run();

            return new Response(JSON.stringify({
                code: 200,
                message: 'Category order updated successfully'
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return this.errorResponse(`Failed to update category order: ${e.message}`, 500);
        }
    },
    errorResponse(message, status) {
        return new Response(JSON.stringify({ code: status, message: message }), {
            status: status,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};


/**
 * 处理后台管理页面请求
 */
const admin = {
    async handleRequest(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/admin/logout') {
            if (request.method !== 'POST') {
                return new Response('Method Not Allowed', { status: 405 });
            }
            const { token } = await validateAdminSession(request, env);
            if (token) {
                await destroyAdminSession(env, token);
            }
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/admin',
                    'Set-Cookie': buildSessionCookie('', { maxAge: 0 }),
                },
            });
        }

        if (url.pathname === '/admin') {
            if (request.method === 'POST') {
                const formData = await request.formData();
                const name = (formData.get('name') || '').trim();
                const password = (formData.get('password') || '').trim();

                const storedUsername = await env.NAV_AUTH.get('admin_username');
                const storedPassword = await env.NAV_AUTH.get('admin_password');

                const isValid =
                    storedUsername &&
                    storedPassword &&
                    name === storedUsername &&
                    password === storedPassword;

                if (isValid) {
                    const token = await createAdminSession(env);
                    return new Response(null, {
                        status: 302,
                        headers: {
                            Location: '/admin',
                            'Set-Cookie': buildSessionCookie(token),
                        },
                    });
                }

                return this.renderLoginPage('账号或密码错误，请重试。');
            }

            const session = await validateAdminSession(request, env);
            if (session.authenticated) {
                return this.renderAdminPage();
            }

            return this.renderLoginPage();
        }

        if (url.pathname.startsWith('/static')) {
            return this.handleStatic(request, env, ctx);
        }

        return new Response('页面不存在', { status: 404 });
    },
    async handleStatic(request, env, ctx) {
        const url = new URL(request.url);
        const filePath = url.pathname.replace('/static/', '');

        let contentType = 'text/plain';
        if (filePath.endsWith('.css')) {
            contentType = 'text/css';
        } else if (filePath.endsWith('.js')) {
            contentType = 'application/javascript';
        }

        try {
            const fileContent = await this.getFileContent(filePath)
            return new Response(fileContent, {
                headers: { 'Content-Type': contentType }
            });
        } catch (e) {
            return new Response('Not Found', { status: 404 });
        }

    },
    async getFileContent(filePath) {
        const fileContents = {
            'admin.html': `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>书签管理页面</title>
      <link rel="stylesheet" href="/static/admin.css">
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body>
      <div class="container">
          <header class="admin-header">
            <div>
              <h1>书签管理</h1>
              <p class="admin-subtitle">管理后台仅限受信任的管理员使用，请妥善保管账号</p>
            </div>
            <form method="post" action="/admin/logout">
              <button type="submit" class="logout-btn">退出登录</button>
            </form>
          </header>
      
          <div class="import-export">
            <input type="file" id="importFile" accept=".json" style="display:none;">
            <button id="importBtn">导入</button>
            <button id="exportBtn">导出</button>
          </div>
      
          <!-- [优化] 添加区域HTML结构，并新增排序输入框 -->
          <div class="add-new">
            <input type="text" id="addName" placeholder="Name" required>
            <input type="text" id="addUrl" placeholder="URL" required>
            <input type="text" id="addLogo" placeholder="Logo(optional)">
            <input type="text" id="addDesc" placeholder="Description(optional)">
            <input type="text" id="addCatelog" placeholder="Catelog" required>
            <input type="number" id="addSortOrder" placeholder="排序 (数字小靠前)">
            <button id="addBtn">添加</button>
          </div>
          <div id="message" style="display: none;padding:1rem;border-radius: 0.5rem;margin-bottom: 1rem;"></div>
         <div class="tab-wrapper">
              <div class="tab-buttons">
                 <button class="tab-button active" data-tab="config">书签列表</button>
                 <button class="tab-button" data-tab="pending">待审核列表</button>
                 <button class="tab-button" data-tab="categories">分类排序</button>
              </div>
               <div id="config" class="tab-content active">
                    <div class="table-wrapper">
                        <table id="configTable">
                            <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Name</th>
                                  <th>URL</th>
                                  <th>Logo</th>
                                  <th>Description</th>
                                  <th>Catelog</th>
                                  <th>排序</th> <!-- [新增] 表格头增加排序 -->
                                  <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="configTableBody">
                              <!-- data render by js -->
                            </tbody>
                        </table>
                        <div class="pagination">
                              <button id="prevPage" disabled>上一页</button>
                              <span id="currentPage">1</span>/<span id="totalPages">1</span>
                              <button id="nextPage" disabled>下一页</button>
                        </div>
                   </div>
                </div>
               <div id="pending" class="tab-content">
                 <div class="table-wrapper">
                   <table id="pendingTable">
                      <thead>
                        <tr>
                            <th>ID</th>
                             <th>Name</th>
                             <th>URL</th>
                            <th>Logo</th>
                            <th>Description</th>
                            <th>Catelog</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody id="pendingTableBody">
                       <!-- data render by js -->
                        </tbody>
                    </table>
                     <div class="pagination">
                      <button id="pendingPrevPage" disabled>上一页</button>
                       <span id="pendingCurrentPage">1</span>/<span id="pendingTotalPages">1</span>
                      <button id="pendingNextPage" disabled>下一页</button>
                    </div>
               </div>
              </div>
              <div id="categories" class="tab-content">
                <div class="table-wrapper">
                  <div class="category-toolbar">
                    <p class="category-hint">设置分类排序值（数字越小越靠前），留空表示使用默认顺序。</p>
                    <button id="refreshCategories" type="button">刷新</button>
                  </div>
                  <table id="categoryTable">
                    <thead>
                      <tr>
                        <th>分类</th>
                        <th>书签数量</th>
                        <th>排序值</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody id="categoryTableBody">
                      <tr><td colspan="4">加载中...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
      </div>
      <script src="/static/admin.js"></script>
    </body>
    </html>`,
            'admin.css': `body {
        font-family: 'Noto Sans SC', sans-serif;
        margin: 0;
        padding: 10px; /* [优化] 移动端边距 */
        background-color: #f8f9fa;
        color: #212529;
    }
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
    }
    .modal-content {
        background-color: #fff;
        margin: 10% auto;
        padding: 20px;
        border: 1px solid #dee2e6;
        width: 80%; /* [优化] 调整宽度以适应移动端 */
        max-width: 600px;
        border-radius: 8px;
        position: relative;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .modal-close {
        color: #6c757d;
        position: absolute;
        right: 10px;
        top: 0;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .modal-close:hover,
    .modal-close:focus {
        color: #343a40; /* 悬停时颜色加深 */
        text-decoration: none;
        cursor: pointer;
    }
    .modal-content form {
        display: flex;
        flex-direction: column;
    }
    
    .modal-content form label {
        margin-bottom: 5px;
        font-weight: 500; /* 字重 */
        color: #495057; /* 标签颜色 */
    }
    .modal-content form input {
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #ced4da; /* 输入框边框 */
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s;
    }
    .modal-content form input:focus {
        border-color: #80bdff; /* 焦点边框颜色 */
        box-shadow:0 0 0 0.2rem rgba(0,123,255,.25);
    }
    .modal-content form input:focus {
        border-color: #80bdff; /* 焦点边框颜色 */
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    .modal-content button[type='submit'] {
        margin-top: 10px;
        background-color: #007bff; /* 提交按钮颜色 */
        color: #fff;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }
    
    .modal-content button[type='submit']:hover {
        background-color: #0056b3; /* 悬停时颜色加深 */
    }
.container {
        max-width: 1200px;
        margin: 0 auto; /* [优化] 移动端居中 */
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .admin-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
    }
    @media (min-width: 768px) {
        .admin-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }
    }
    h1 {
        font-size: 1.75rem;
        margin: 0;
        color: #343a40;
    }
    .admin-subtitle {
        margin: 4px 0 0;
        color: #6c757d;
        font-size: 0.95rem;
    }
    .logout-btn {
        background-color: #f8f9fa;
        color: #495057;
        border: 1px solid #ced4da;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.95rem;
        transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
    }
    .logout-btn:hover {
        background-color: #e9ecef;
        color: #212529;
        box-shadow: 0 3px 10px rgba(0,0,0,0.08);
    }
    .tab-wrapper {
        margin-top: 20px;
    }
    .tab-buttons {
        display: flex;
        margin-bottom: 10px;
        flex-wrap: wrap; /* [优化] 移动端换行 */
    }
    .tab-button {
        background-color: #e9ecef;
        border: 1px solid #dee2e6;
        padding: 10px 15px;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        color: #495057; /* tab按钮文字颜色 */
        transition: background-color 0.2s, color 0.2s;
    }
    .tab-button.active {
        background-color: #fff;
        border-bottom: 1px solid #fff;
        color: #212529; /* 选中tab颜色 */
    }
    .tab-button:hover {
        background-color: #f0f0f0;
    }
    .tab-content {
        display: none;
        border: 1px solid #dee2e6;
        padding: 10px;
        border-top: none;
    }
    .tab-content.active {
        display: block;
    }
    
    .import-export {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        justify-content: flex-end;
        flex-wrap: wrap; /* [优化] 移动端换行 */
    }
    
 /* [优化] 添加区域适配移动端 */
    .add-new {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap; /* 核心：允许换行 */
    }
    .add-new > input {
        flex: 1 1 150px; /* 弹性布局，基础宽度150px，允许伸缩 */
        min-width: 150px; /* 最小宽度 */
    }
    .add-new > button {
        flex-basis: 100%; /* 在移动端，按钮占据一整行 */
    }
    input[type="text"] {
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
        margin-bottom: 5px;
         transition: border-color 0.2s;
    }
	   @media (min-width: 768px) {
        .add-new > button {
            flex-basis: auto; /* 在桌面端，按钮恢复自动宽度 */
        }
    }
    input[type="text"], input[type="number"] {
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 1rem;
        outline: none;
        margin-bottom: 5px;
         transition: border-color 0.2s;
    }
    input[type="text"]:focus, input[type="number"]:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
    button {
        background-color: #6c63ff; /* 主色调 */
        color: #fff;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }
    button:hover {
        background-color: #534dc4;
    }
    /* [优化] 保证表格在小屏幕上可以横向滚动 */
    .table-wrapper {
        overflow-x: auto;
    }
    table {
        width: 100%;
        min-width: 800px; /* 设置一个最小宽度，当屏幕小于此值时出现滚动条 */
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    th, td {
        border: 1px solid #dee2e6;
        padding: 10px;
        text-align: left;
        color: #495057; /* 表格文字颜色 */
    }
    th {
        background-color: #f2f2f2;
        font-weight: 600;
    }
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    .category-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        gap: 10px;
        flex-wrap: wrap;
    }
    .category-hint {
        margin: 0;
        font-size: 0.85rem;
        color: #6c757d;
    }
    #refreshCategories {
        background-color: #f8f9fa;
        color: #495057;
        border: 1px solid #ced4da;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
    }
    #refreshCategories:hover {
        background-color: #e9ecef;
    }
    .category-sort-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #ced4da;
        border-radius: 4px;
    }
    .category-sort-input:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
        outline: none;
    }
    .category-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }
    .category-actions button {
        padding: 5px 10px;
        font-size: 0.85rem;
    }
    .category-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .actions {
        display: flex;
        gap: 5px;
    }
    .actions button {
        padding: 5px 8px;
        font-size: 0.8rem;
    }
    .edit-btn {
        background-color: #17a2b8; /* 编辑按钮颜色 */
    }
    
    .del-btn {
        background-color: #dc3545; /* 删除按钮颜色 */
    }
    .pagination {
        text-align: center;
        margin-top: 20px;
    }
    .pagination button {
        margin: 0 5px;
        background-color: #e9ecef; /* 分页按钮颜色 */
        color: #495057;
        border: 1px solid #ced4da;
    }
    .pagination button:hover {
        background-color: #dee2e6;
    }
    
    .success {
        background-color: #28a745;
        color: #fff;
    }
    .error {
        background-color: #dc3545;
        color: #fff;
    }
      `,
            'admin.js': `
          const configTableBody = document.getElementById('configTableBody');
          const prevPageBtn = document.getElementById('prevPage');
          const nextPageBtn = document.getElementById('nextPage');
          const currentPageSpan = document.getElementById('currentPage');
          const totalPagesSpan = document.getElementById('totalPages');
          
          const pendingTableBody = document.getElementById('pendingTableBody');
            const pendingPrevPageBtn = document.getElementById('pendingPrevPage');
            const pendingNextPageBtn = document.getElementById('pendingNextPage');
            const pendingCurrentPageSpan = document.getElementById('pendingCurrentPage');
            const pendingTotalPagesSpan = document.getElementById('pendingTotalPages');
          
          const messageDiv = document.getElementById('message');
          const categoryTableBody = document.getElementById('categoryTableBody');
          const refreshCategoriesBtn = document.getElementById('refreshCategories');
          
          var escapeHTML = function(value) {
            var result = '';
            if (value !== null && value !== undefined) {
              result = String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            }
            return result;
          };
          
          var normalizeUrl = function(value) {
            var trimmed = String(value || '').trim();
            var normalized = '';
            if (/^https?:\\/\\//i.test(trimmed)) {
              normalized = trimmed;
            } else if (/^[\\w.-]+\\.[\\w.-]+/.test(trimmed)) {
              normalized = 'https://' + trimmed;
            }
            return normalized;
          };
          
          const addBtn = document.getElementById('addBtn');
          const addName = document.getElementById('addName');
          const addUrl = document.getElementById('addUrl');
          const addLogo = document.getElementById('addLogo');
          const addDesc = document.getElementById('addDesc');
          const addCatelog = document.getElementById('addCatelog');
		  const addSortOrder = document.getElementById('addSortOrder'); // [新增] 获取排序输入框
          
          const importBtn = document.getElementById('importBtn');
          const importFile = document.getElementById('importFile');
          const exportBtn = document.getElementById('exportBtn');
          
           const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
          
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                tabButtons.forEach(b => b.classList.remove('active'));
                 button.classList.add('active');
                tabContents.forEach(content => {
                   content.classList.remove('active');
                    if(content.id === tab) {
                       content.classList.add('active');
                     }
                  })
                if (tab === 'categories') {
                  fetchCategories();
                }
            });
          });

          if (refreshCategoriesBtn) {
            refreshCategoriesBtn.addEventListener('click', () => {
              fetchCategories();
            });
          }

          
          // 添加搜索框
          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = '搜索书签(名称，URL，分类)';
          searchInput.id = 'searchInput';
          searchInput.style.marginBottom = '10px';
          document.querySelector('.add-new').parentNode.insertBefore(searchInput, document.querySelector('.add-new'));
          
          
          let currentPage = 1;
          let pageSize = 10;
          let totalItems = 0;
          let allConfigs = []; // 保存所有配置数据
          let currentSearchKeyword = ''; // 保存当前搜索关键词
          
          let pendingCurrentPage = 1;
            let pendingPageSize = 10;
            let pendingTotalItems = 0;
            let allPendingConfigs = []; // 保存所有待审核配置数据
          let categoriesData = []; // 保存分类排序数据
          
          // 创建编辑模态框
          const editModal = document.createElement('div');
          editModal.className = 'modal';
          editModal.style.display = 'none';
          editModal.innerHTML = \`
            <div class="modal-content">
              <span class="modal-close">×</span>
              <h2>编辑站点</h2>
              <form id="editForm">
                <input type="hidden" id="editId">
                <label for="editName">名称:</label>
                <input type="text" id="editName" required><br>
                <label for="editUrl">URL:</label>
                <input type="text" id="editUrl" required><br>
                <label for="editLogo">Logo(可选):</label>
                <input type="text" id="editLogo"><br>
                <label for="editDesc">描述(可选):</label>
                <input type="text" id="editDesc"><br>
                <label for="editCatelog">分类:</label>
                <input type="text" id="editCatelog" required><br>
			    <label for="editSortOrder">排序:</label> <!-- [新增] -->
                <input type="number" id="editSortOrder"><br> <!-- [新增] -->
                <button type="submit">保存</button>
              </form>
            </div>
          \`;
          document.body.appendChild(editModal);
          
          const modalClose = editModal.querySelector('.modal-close');
          modalClose.addEventListener('click', () => {
            editModal.style.display = 'none';
          });
          
          const editForm = document.getElementById('editForm');
          editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const name = document.getElementById('editName').value;
            const url = document.getElementById('editUrl').value;
            const logo = document.getElementById('editLogo').value;
            const desc = document.getElementById('editDesc').value;
            const catelog = document.getElementById('editCatelog').value;
                const sort_order = document.getElementById('editSortOrder').value; // [新增]
            const payload = {
                name: name.trim(),
                url: url.trim(),
                logo: logo.trim(),
                desc: desc.trim(),
                catelog: catelog.trim()
            };
            if (sort_order !== '') {
                payload.sort_order = Number(sort_order);
            }
            fetch(\`/api/config/\${id}\`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            }).then(res => res.json())
              .then(data => {
                if (data.code === 200) {
                  showMessage('修改成功', 'success');
                  fetchConfigs();
                  editModal.style.display = 'none'; // 关闭弹窗
                } else {
                  showMessage(data.message, 'error');
                }
              }).catch(err => {
                showMessage('网络错误', 'error');
              })
          });
          
          
          function fetchConfigs(page = currentPage, keyword = currentSearchKeyword) {
              let url = \`/api/config?page=\${page}&pageSize=\${pageSize}\`;
              if(keyword) {
                  url = \`/api/config?page=\${page}&pageSize=\${pageSize}&keyword=\${keyword}\`
              }
              fetch(url)
                  .then(res => res.json())
                  .then(data => {
                      if (data.code === 200) {
                          totalItems = data.total;
                          currentPage = data.page;
                                                 totalPagesSpan.innerText = Math.ceil(totalItems / pageSize);
                          currentPageSpan.innerText = currentPage;
                          allConfigs = data.data; // 保存所有数据
                          renderConfig(allConfigs);
                          updatePaginationButtons();
                      } else {
                          showMessage(data.message, 'error');
                      }
                  }).catch(err => {
                  showMessage('网络错误', 'error');
              })
          }
          function renderConfig(configs) {
          configTableBody.innerHTML = '';
           if (configs.length === 0) {
                configTableBody.innerHTML = '<tr><td colspan="7">没有配置数据</td></tr>';
                return
            }
          configs.forEach(config => {
              const row = document.createElement('tr');
              const safeName = escapeHTML(config.name || '');
              const normalizedUrl = normalizeUrl(config.url);
              const displayUrl = config.url ? escapeHTML(config.url) : '未提供';
              const urlCell = normalizedUrl
                ? \`<a href="\${escapeHTML(normalizedUrl)}" target="_blank" rel="noopener noreferrer">\${escapeHTML(normalizedUrl)}</a>\`
                : displayUrl;
              const normalizedLogo = normalizeUrl(config.logo);
              const logoCell = normalizedLogo
                ? \`<img src="\${escapeHTML(normalizedLogo)}" alt="\${safeName}" style="width:30px;" />\`
                : 'N/A';
              const descCell = config.desc ? escapeHTML(config.desc) : 'N/A';
              const catelogCell = escapeHTML(config.catelog || '');
              const sortValue = config.sort_order === 9999 || config.sort_order === null || config.sort_order === undefined
                ? '默认'
                : escapeHTML(config.sort_order);
               row.innerHTML = \`
                 <td>\${config.id}</td>
                  <td>\${safeName}</td>
                  <td>\${urlCell}</td>
                  <td>\${logoCell}</td>
                  <td>\${descCell}</td>
                  <td>\${catelogCell}</td>
				 <td>\${sortValue}</td> <!-- [新增] 显示排序值 -->
                  <td class="actions">
                    <button class="edit-btn" data-id="\${config.id}">编辑</button>
                    <button class="del-btn" data-id="\${config.id}">删除</button>
                  </td>
               \`;
              configTableBody.appendChild(row);
          });
            bindActionEvents();
          }
          
          function bindActionEvents() {
           document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                    handleEdit(id);
                })
           });
          
          document.querySelectorAll('.del-btn').forEach(btn => {
               btn.addEventListener('click', function() {
                  const id = this.dataset.id;
                   handleDelete(id)
               })
          })
         }

          function fetchCategories() {
            if (!categoryTableBody) {
              return;
            }
            categoryTableBody.innerHTML = '<tr><td colspan="4">加载中...</td></tr>';
            fetch('/api/categories')
              .then(res => res.json())
              .then(data => {
                if (data.code === 200) {
                  categoriesData = data.data || [];
                  renderCategories(categoriesData);
                } else {
                  showMessage(data.message || '加载分类失败', 'error');
                  categoryTableBody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>';
                }
              }).catch(() => {
                showMessage('网络错误', 'error');
                categoryTableBody.innerHTML = '<tr><td colspan="4">加载失败</td></tr>';
              });
          }

          function renderCategories(categories) {
            if (!categoryTableBody) {
              return;
            }
            categoryTableBody.innerHTML = '';
            if (!categories || categories.length === 0) {
              categoryTableBody.innerHTML = '<tr><td colspan="4">暂无分类数据</td></tr>';
              return;
            }

            categories.forEach(item => {
              const row = document.createElement('tr');

              const nameCell = document.createElement('td');
              nameCell.textContent = item.catelog;
              row.appendChild(nameCell);

              const countCell = document.createElement('td');
              countCell.textContent = item.site_count;
              row.appendChild(countCell);

              const sortCell = document.createElement('td');
              const input = document.createElement('input');
              input.type = 'number';
              input.className = 'category-sort-input';
              if (item.explicit) {
                input.value = item.sort_order;
              } else {
                input.placeholder = item.sort_order;
              }
              input.setAttribute('data-category', item.catelog);
              sortCell.appendChild(input);

              const hint = document.createElement('small');
              hint.textContent = '当前默认值：' + item.sort_order;
              hint.style.display = 'block';
              hint.style.marginTop = '4px';
              hint.style.fontSize = '0.75rem';
              hint.style.color = '#6c757d';
              sortCell.appendChild(hint);
              row.appendChild(sortCell);

              const actionCell = document.createElement('td');
              actionCell.className = 'category-actions';

              const saveBtn = document.createElement('button');
              saveBtn.className = 'category-save-btn';
              saveBtn.textContent = '保存';
              saveBtn.setAttribute('data-category', item.catelog);
              actionCell.appendChild(saveBtn);

              const resetBtn = document.createElement('button');
              resetBtn.className = 'category-reset-btn';
              resetBtn.textContent = '重置';
              resetBtn.setAttribute('data-category', item.catelog);
              if (!item.explicit) {
                resetBtn.disabled = true;
              }
              actionCell.appendChild(resetBtn);

              row.appendChild(actionCell);
              categoryTableBody.appendChild(row);
            });

            bindCategoryEvents();
          }

          function bindCategoryEvents() {
            if (!categoryTableBody) {
              return;
            }
            categoryTableBody.querySelectorAll('.category-save-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const input = this.closest('tr').querySelector('.category-sort-input');
                if (!category || !input) {
                  return;
                }
                const rawValue = input.value.trim();
                if (rawValue === '') {
                  showMessage('请输入排序值，或使用“重置”恢复默认。', 'error');
                  return;
                }
                const sortValue = Number(rawValue);
                if (!Number.isFinite(sortValue)) {
                  showMessage('排序值必须为数字', 'error');
                  return;
                }
                fetch('/api/categories/' + encodeURIComponent(category), {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ sort_order: sortValue })
                }).then(res => res.json())
                  .then(data => {
                    if (data.code === 200) {
                      showMessage('分类排序已更新', 'success');
                      fetchCategories();
                    } else {
                      showMessage(data.message || '更新失败', 'error');
                    }
                  }).catch(() => {
                    showMessage('网络错误', 'error');
                  });
              });
            });

            categoryTableBody.querySelectorAll('.category-reset-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                if (this.disabled) {
                  return;
                }
                const category = this.getAttribute('data-category');
                if (!category) {
                  return;
                }
                if (!confirm('确定恢复该分类的默认排序吗？')) {
                  return;
                }
                fetch('/api/categories/' + encodeURIComponent(category), {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ reset: true })
                }).then(res => res.json())
                  .then(data => {
                    if (data.code === 200) {
                      showMessage('已重置分类排序', 'success');
                      fetchCategories();
                    } else {
                      showMessage(data.message || '重置失败', 'error');
                    }
                  }).catch(() => {
                    showMessage('网络错误', 'error');
                  });
              });
            });
          }

    // [优化] 点击编辑时，获取并填充排序字段
          function handleEdit(id) {
            fetch(\`/api/config?page=1&pageSize=1000\`) // A simple way to get all configs to find the one to edit
            .then(res => res.json())
            .then(data => {
                const configToEdit = data.data.find(c => c.id == id);
                if (!configToEdit) {
                    showMessage('找不到要编辑的数据', 'error');
                    return;
                }
                document.getElementById('editId').value = configToEdit.id;
                document.getElementById('editName').value = configToEdit.name;
                document.getElementById('editUrl').value = configToEdit.url;
                document.getElementById('editLogo').value = configToEdit.logo || '';
                document.getElementById('editDesc').value = configToEdit.desc || '';
                document.getElementById('editCatelog').value = configToEdit.catelog;
                document.getElementById('editSortOrder').value = configToEdit.sort_order === 9999 ? '' : configToEdit.sort_order; // [新增]
                editModal.style.display = 'block';
            });
          }
          function handleDelete(id) {
            if(!confirm('确认删除？')) return;
             fetch(\`/api/config/\${id}\`, {
                  method: 'DELETE'
              }).then(res => res.json())
                 .then(data => {
                     if (data.code === 200) {
                         showMessage('删除成功', 'success');
                         fetchConfigs();
                     } else {
                         showMessage(data.message, 'error');
                     }
                 }).catch(err => {
                      showMessage('网络错误', 'error');
                 })
          }
          function showMessage(message, type) {
            messageDiv.innerText = message;
            messageDiv.className = type;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
          }
          
          function updatePaginationButtons() {
            prevPageBtn.disabled = currentPage === 1;
             nextPageBtn.disabled = currentPage >= Math.ceil(totalItems/pageSize)
          }
          
          prevPageBtn.addEventListener('click', () => {
          if(currentPage > 1) {
              fetchConfigs(currentPage -1);
          }
          });
          nextPageBtn.addEventListener('click', () => {
            if (currentPage < Math.ceil(totalItems/pageSize)) {
              fetchConfigs(currentPage + 1);
            }
          });
          
          addBtn.addEventListener('click', () => {
            const name = addName.value;
            const url = addUrl.value;
            const logo = addLogo.value;
            const desc = addDesc.value;
             const catelog = addCatelog.value;
          const sort_order = addSortOrder.value; // [新增]			 
            if(!name ||    !url || !catelog) {
              showMessage('名称,URL,分类 必填', 'error');
              return;
          }
          const payload = {
             name: name.trim(),
             url: url.trim(),
             logo: logo.trim(),
             desc: desc.trim(),
             catelog: catelog.trim()
          };
          if (sort_order !== '') {
             payload.sort_order = Number(sort_order);
          }
          fetch('/api/config', {        method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
          }).then(res => res.json())
          .then(data => {
             if(data.code === 201) {
                 showMessage('添加成功', 'success');
                addName.value = '';
                addUrl.value = '';
                addLogo.value = '';
                addDesc.value = '';
                 addCatelog.value = '';
        addSortOrder.value = ''; // [新增]				 
                 fetchConfigs();
             }else {
                showMessage(data.message, 'error');
             }
          }).catch(err => {
            showMessage('网络错误', 'error');
          })
          });
          
          importBtn.addEventListener('click', () => {
          importFile.click();
          });
          importFile.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
           const reader = new FileReader();
          reader.onload = function(event) {
             try {
                 const jsonData = JSON.parse(event.target.result);
                   fetch('/api/config/import', {
                       method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                       body: JSON.stringify(jsonData)
                  }).then(res => res.json())
                     .then(data => {
                          if(data.code === 201) {
                             showMessage('导入成功', 'success');
                              fetchConfigs();
                          } else {
                             showMessage(data.message, 'error');
                          }
                     }).catch(err => {
                           showMessage('网络错误', 'error');
                  })
          
             } catch (error) {
                   showMessage('JSON格式不正确', 'error');
             }
          }
           reader.readAsText(file);
          }
          })
          exportBtn.addEventListener('click', () => {
          fetch('/api/config/export')
          .then(res => res.blob())
          .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'config.json';
          document.body.appendChild(a);
          a.click();
           window.URL.revokeObjectURL(url);
           document.body.removeChild(a);
          }).catch(err => {
          showMessage('网络错误', 'error');
          })
          })
          
          // 搜索功能
          searchInput.addEventListener('input', () => {
              currentSearchKeyword = searchInput.value.trim();
              currentPage = 1; // 搜索时重置为第一页
              fetchConfigs(currentPage,currentSearchKeyword);
          });
          
          
          function fetchPendingConfigs(page = pendingCurrentPage) {
                  fetch(\`/api/pending?page=\${page}&pageSize=\${pendingPageSize}\`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.code === 200) {
                               pendingTotalItems = data.total;
                               pendingCurrentPage = data.page;
                               pendingTotalPagesSpan.innerText = Math.ceil(pendingTotalItems/ pendingPageSize);
                                pendingCurrentPageSpan.innerText = pendingCurrentPage;
                               allPendingConfigs = data.data;
                                 renderPendingConfig(allPendingConfigs);
                                updatePendingPaginationButtons();
                        } else {
                            showMessage(data.message, 'error');
                        }
                      }).catch(err => {
                      showMessage('网络错误', 'error');
                   })
          }
          
            function renderPendingConfig(configs) {
                  pendingTableBody.innerHTML = '';
                  if(configs.length === 0) {
                      pendingTableBody.innerHTML = '<tr><td colspan="7">没有待审核数据</td></tr>';
                      return
                  }
                configs.forEach(config => {
                    const row = document.createElement('tr');
                    const safeName = escapeHTML(config.name || '');
                    const normalizedUrl = normalizeUrl(config.url);
                    const urlCell = normalizedUrl
                      ? \`<a href="\${escapeHTML(normalizedUrl)}" target="_blank" rel="noopener noreferrer">\${escapeHTML(normalizedUrl)}</a>\`
                      : (config.url ? escapeHTML(config.url) : '未提供');
                    const normalizedLogo = normalizeUrl(config.logo);
                    const logoCell = normalizedLogo
                      ? \`<img src="\${escapeHTML(normalizedLogo)}" alt="\${safeName}" style="width:30px;" />\`
                      : 'N/A';
                    const descCell = config.desc ? escapeHTML(config.desc) : 'N/A';
                    const catelogCell = escapeHTML(config.catelog || '');
                    row.innerHTML = \`
                      <td>\${config.id}</td>
                       <td>\${safeName}</td>
                       <td>\${urlCell}</td>
                       <td>\${logoCell}</td>
                       <td>\${descCell}</td>
                       <td>\${catelogCell}</td>
                        <td class="actions">
                            <button class="approve-btn" data-id="\${config.id}">批准</button>
                          <button class="reject-btn" data-id="\${config.id}">拒绝</button>
                        </td>
                      \`;
                    pendingTableBody.appendChild(row);
                });
                bindPendingActionEvents();
            }
           function bindPendingActionEvents() {
               document.querySelectorAll('.approve-btn').forEach(btn => {
                   btn.addEventListener('click', function() {
                       const id = this.dataset.id;
                       handleApprove(id);
                   })
               });
              document.querySelectorAll('.reject-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                         const id = this.dataset.id;
                         handleReject(id);
                     })
              })
           }
          
          function handleApprove(id) {
             if (!confirm('确定批准吗？')) return;
             fetch(\`/api/pending/\${id}\`, {
                   method: 'PUT',
                 }).then(res => res.json())
               .then(data => {
                    if (data.code === 200) {
                        showMessage('批准成功', 'success');
                        fetchPendingConfigs();
                         fetchConfigs();
                    } else {
                         showMessage(data.message, 'error')
                     }
                }).catch(err => {
                      showMessage('网络错误', 'error');
                  })
          }
           function handleReject(id) {
               if (!confirm('确定拒绝吗？')) return;
              fetch(\`/api/pending/\${id}\`, {
                     method: 'DELETE'
                }).then(res => res.json())
                   .then(data => {
                     if(data.code === 200) {
                         showMessage('拒绝成功', 'success');
                        fetchPendingConfigs();
                    } else {
                       showMessage(data.message, 'error');
                   }
                  }).catch(err => {
                        showMessage('网络错误', 'error');
                })
           }
          function updatePendingPaginationButtons() {
              pendingPrevPageBtn.disabled = pendingCurrentPage === 1;
               pendingNextPageBtn.disabled = pendingCurrentPage >= Math.ceil(pendingTotalItems/ pendingPageSize)
           }
          
           pendingPrevPageBtn.addEventListener('click', () => {
               if (pendingCurrentPage > 1) {
                   fetchPendingConfigs(pendingCurrentPage - 1);
               }
           });
            pendingNextPageBtn.addEventListener('click', () => {
               if (pendingCurrentPage < Math.ceil(pendingTotalItems/pendingPageSize)) {
                   fetchPendingConfigs(pendingCurrentPage + 1)
               }
            });
          
          fetchConfigs();
          fetchPendingConfigs();
          if (categoryTableBody) {
            fetchCategories();
          }
          `
        }
        return fileContents[filePath]
    },

    async renderAdminPage() {
        const html = await this.getFileContent('admin.html');
        return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    },

    async renderLoginPage(message = '') {
        const hasError = Boolean(message);
        const safeMessage = hasError ? escapeHTML(message) : '';
        const html = `<!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>管理员登录</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          /* [优化] 全局重置与现代CSS最佳实践 */
          *, *::before, *::after {
            box-sizing: border-box;
          }
          
          html, body {
            height: 100%; /* 确保flex容器能撑满整个屏幕 */
            margin: 0;
            padding: 0;
            font-family: 'Noto Sans SC', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* [优化] 主体布局，确保在任何设备上都完美居中 */
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f8f9fa;
            padding: 1rem; /* 为小屏幕提供安全边距 */
          }

          /* [优化] 登录容器样式 */
          .login-container {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.05);
            width: 100%;
            max-width: 380px;
            animation: fadeIn 0.5s ease-out;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .login-title {
            font-size: 1.75rem; /* 稍大一点更醒目 */
            font-weight: 700;
            text-align: center;
            margin: 0 0 1.5rem 0;
            color: #333;
          }

          .form-group {
            margin-bottom: 1.25rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #555;
          }

          input[type="text"], input[type="password"] {
            width: 100%;
            padding: 0.875rem 1rem; /* 调整内边距，手感更好 */
            border: 1px solid #ddd;
            border-radius: 6px; /* 稍大的圆角 */
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          input:focus {
            border-color: #7209b7;
            outline: none;
            box-shadow: 0 0 0 3px rgba(114, 9, 183, 0.15);
          }

          button {
            width: 100%;
            padding: 0.875rem;
            background-color: #7209b7;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
          }

          button:hover {
            background-color: #5a067c;
          }
          
          button:active {
            transform: scale(0.98);
          }

          .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            text-align: center;
            display: none;
          }

          .back-link {
            display: block;
            text-align: center;
            margin-top: 1.5rem;
            color: #7209b7;
            text-decoration: none;
            font-size: 0.875rem;
          }

          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h1 class="login-title">管理员登录</h1>
          <form method="post" action="/admin" novalidate>
            <div class="form-group">
              <label for="username">用户名</label>
              <input type="text" id="username" name="name" required autocomplete="username">
            </div>
            <div class="form-group">
              <label for="password">密码</label>
              <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            ${hasError ? `<div class="error-message" style="display:block;">${safeMessage}</div>` : `<div class="error-message">用户名或密码错误</div>`}
            <button type="submit">登 录</button>
          </form>
          <a href="/" class="back-link">返回首页</a>
        </div>
      </body>
      </html>`;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
};


/**
 * 优化后的主逻辑：处理请求，返回优化后的 HTML
 */
async function handleRequest(request, env, ctx) {
    const url = new URL(request.url);
    const catalog = url.searchParams.get('catalog');
    const keyword = url.searchParams.get('keyword');

    let sites = [];
    try {
        const { results } = await env.NAV_DB.prepare('SELECT * FROM sites ORDER BY sort_order ASC, create_time DESC').all();
        sites = results;
    } catch (e) {
        return new Response(`Failed to fetch data: ${e.message}`, { status: 500 });
    }

    if (!sites) {
        sites = [];
    }

    // 搜索过滤
    let filteredSites = sites;
    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filteredSites = filteredSites.filter(site => {
            return (site.name && site.name.toLowerCase().includes(lowerKeyword)) ||
                (site.desc && site.desc.toLowerCase().includes(lowerKeyword)) ||
                (site.url && site.url.toLowerCase().includes(lowerKeyword)) ||
                (site.catelog && site.catelog.toLowerCase().includes(lowerKeyword));
        });
    }

    // 获取分类
    const categoryMinSort = new Map();
    const categorySet = new Set();
    sites.forEach((site) => {
        const categoryName = (site.catelog || '').trim() || '未分类';
        categorySet.add(categoryName);
        const rawSort = Number(site.sort_order);
        const normalized = Number.isFinite(rawSort) ? rawSort : 9999;
        if (!categoryMinSort.has(categoryName) || normalized < categoryMinSort.get(categoryName)) {
            categoryMinSort.set(categoryName, normalized);
        }
    });

    const categoryOrderMap = new Map();
    try {
        const { results: orderRows } = await env.NAV_DB.prepare('SELECT catelog, sort_order FROM category_orders').all();
        orderRows.forEach(row => {
            categoryOrderMap.set(row.catelog, normalizeSortOrder(row.sort_order));
        });
    } catch (error) {
        // ignore error
    }

    const catalogsWithMeta = Array.from(categorySet).map((name) => {
        const fallbackSort = categoryMinSort.has(name) ? normalizeSortOrder(categoryMinSort.get(name)) : 9999;
        const order = categoryOrderMap.has(name) ? categoryOrderMap.get(name) : fallbackSort;
        return {
            name,
            order,
            fallback: fallbackSort,
        };
    });

    catalogsWithMeta.sort((a, b) => {
        if (a.order !== b.order) {
            return a.order - b.order;
        }
        if (a.fallback !== b.fallback) {
            return a.fallback - b.fallback;
        }
        return a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'base' });
    });

    const catalogs = catalogsWithMeta.map(item => item.name);

    // 分类过滤
    const requestedCatalog = (catalog || '').trim();
    const catalogExists = Boolean(requestedCatalog && catalogs.includes(requestedCatalog));

    if (catalogExists) {
        filteredSites = filteredSites.filter((s) => {
            const catValue = (s.catelog || '').trim() || '未分类';
            return catValue === requestedCatalog;
        });
    }

    const totalSites = sites.length;

    // 生成分类按钮
    const allActive = !catalogExists;
    const allBtnClass = allActive
        ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white';
    let allHref = '?';
    if (keyword) allHref += `keyword=${encodeURIComponent(keyword)}`;

    const categoryButtonsHtml = catalogs.map(cat => {
        const isActive = catalogExists && cat === requestedCatalog;
        const btnClass = isActive
            ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white';
        let href = `?catalog=${encodeURIComponent(cat)}`;
        if (keyword) href += `&keyword=${encodeURIComponent(keyword)}`;
        return `<a href="${href}" class="px-6 py-1.5 rounded text-sm font-medium transition ${btnClass} whitespace-nowrap">${escapeHTML(cat)}</a>`;
    }).join('');

    // 生成卡片
    const cardsHtml = filteredSites.map(site => renderSiteCard(site)).join('');

    const pageTitle = catalogExists ? requestedCatalog : '全部';
    const subTitle = keyword ? `搜索: "${escapeHTML(keyword)}"` : '发现最好的资源';

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Awesome Navigation - 发现最好的资源</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&amp;display=swap" rel="stylesheet"/>
<script>
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    primary: "#F48120", 
                    "primary-hover": "#e06c09",
                    "secondary-bg": "#f9fafb",
                    "dark-bg": "#111827",
                    "dark-card": "#1f2937",
                    "dark-text": "#e5e7eb",
                    "dark-border": "#374151",
                    "background-light": "#ffffff",
                    "background-dark": "#111827",
                },
                fontFamily: {
                    display: ["Noto Sans SC", "sans-serif"],
                    sans: ["Noto Sans SC", "sans-serif"],
                },
                borderRadius: {
                    DEFAULT: "0.5rem",
                },
            },
        },
    };
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
</script>
<style>
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
    .dark ::-webkit-scrollbar-thumb { background-color: #4b5563; }
    .decor-line { position: absolute; height: 1px; background-color: #F48120; opacity: 0.6; }
    .decor-dot { position: absolute; width: 6px; height: 6px; background-color: #F48120; border-radius: 50%; }
    .copy-success-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #10B981; color: white; padding: 10px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; opacity: 0; transition: opacity 0.3s; }
    .copy-success-toast.show { opacity: 1; }
</style>
</head>
<body class="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 transition-colors duration-200">
<div id="toast" class="copy-success-toast">复制成功!</div>

<header class="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
<div class="flex items-center space-x-2">
<a href="/" class="text-2xl font-bold flex flex-col leading-tight no-underline group">
<span class="text-gray-800 dark:text-white">Awesome</span>
<span class="flex items-center text-gray-800 dark:text-white">
    Navigation
    <i class="fas fa-compass text-primary ml-1 group-hover:rotate-45 transition-transform duration-500"></i>
</span>
</a>
</div>
<div class="flex items-center space-x-6 text-xl">
<a class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition" href="https://github.com/am-club/cloudflared-web" target="_blank"><i class="fab fa-github"></i></a>
<button class="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition" id="theme-toggle">
<i class="fas fa-moon dark:hidden"></i>
<i class="fas fa-sun hidden dark:inline"></i>
</button>
</div>
</header>
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden min-h-[80vh]">
<div class="hidden lg:block absolute left-0 top-32 w-24">
<div class="relative h-24 border-l border-primary/40 border-t border-b w-full">
<div class="absolute -left-1 top-1/2 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
<div class="absolute right-0 top-0 w-16 h-[1px] bg-primary/40"></div>
<div class="absolute right-0 bottom-0 w-16 h-[1px] bg-primary/40"></div>
</div>
</div>
<div class="hidden lg:block absolute right-0 top-32 w-24 transform rotate-180">
<div class="relative h-24 border-l border-primary/40 border-t border-b w-full">
<div class="absolute -left-1 top-1/2 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
</div>
</div>

<div class="text-center mb-16 relative z-10">
<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
    ${escapeHTML(pageTitle)}
</h1>
<h2 class="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-6 text-gray-500 dark:text-gray-400">
    ${escapeHTML(subTitle)}
</h2>
<p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
    收录了 ${totalSites} 个优质网站资源，助你发现更大的世界。
</p>

<form action="/" method="get" class="max-w-2xl mx-auto relative mb-6">
    <input type="hidden" name="catalog" value="${escapeHTML(requestedCatalog)}">
    <input name="keyword" value="${escapeHTML(keyword || '')}" class="w-full pl-6 pr-12 py-3.5 rounded-lg border-2 border-primary focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none text-gray-700 dark:bg-dark-card dark:text-gray-200 dark:border-primary transition shadow-sm" placeholder="搜索你感兴趣的资源..." type="text"/>
    <button type="submit" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition">
        <i class="fas fa-search"></i>
    </button>
</form>

<div class="flex justify-center items-center space-x-6 text-sm">
<a class="flex items-center text-primary hover:underline" href="#" onclick="alert('请联系管理员提交');return false;">
    提交工具 <span class="ml-1">👉</span>
</a>
</div>
</div>

<div class="flex flex-col md:flex-row justify-center items-center mb-10 space-y-4 md:space-y-0">
    <div class="flex bg-gray-100 dark:bg-dark-card p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
         <a href="${allHref}" class="px-6 py-1.5 rounded text-sm font-medium transition ${allBtnClass} whitespace-nowrap">全部</a>
         ${categoryButtonsHtml}
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  ${cardsHtml.length > 0 ? cardsHtml : '<div class="col-span-full text-center text-gray-500 py-10">暂无相关资源</div>'}
</div>

</main>
<footer class="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border mt-16 pt-16 pb-12">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="flex flex-col md:flex-row justify-between items-center">
    <div class="mb-4 md:mb-0">
        <span class="text-primary font-bold text-lg">Awesome Navigation</span>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">© ${new Date().getFullYear()} All rights reserved.</p>
    </div>
    <div class="flex space-x-6">
        <a href="/admin" class="text-gray-500 hover:text-primary text-sm">管理后台</a>
    </div>
</div>
</div>
</footer>
<div class="fixed bottom-8 right-8 flex flex-col space-y-3 z-50">
<button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="w-12 h-12 bg-primary rounded-lg shadow-lg flex items-center justify-center text-white hover:bg-primary-hover transition transform hover:scale-105">
<i class="fas fa-chevron-up"></i>
</button>
</div>

<script>
    function toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    }
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const url = btn.dataset.url;
            try {
                await navigator.clipboard.writeText(url);
                showToast();
            } catch (err) {
                console.error('Failed to copy!', err);
            }
        });
    });
    function showToast() {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
</script>
</body></html>`;

    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}


// 导出主模块
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname.startsWith('/api')) {
            return api.handleRequest(request, env, ctx);
        } else if (url.pathname === '/admin' || url.pathname.startsWith('/static')) {
            return admin.handleRequest(request, env, ctx);
        } else {
            return handleRequest(request, env, ctx);
        }
    },
};