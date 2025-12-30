DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS items;
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon TEXT,
  status TEXT DEFAULT 'active', -- active, inactive
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data
INSERT INTO categories (name, icon, sort_order) VALUES 
('全部项目', 'category', 0),
('图床', 'image', 1),
('邮箱', 'mail', 2),
('短链', 'link', 3),
('其他工具', 'code', 4);

DROP TABLE IF EXISTS site_settings;
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO site_settings (key, value) VALUES 
('hero_title', '发现最好的'),
('hero_subtitle', 'Cloudflare 开源工具 & 文档'),
('hero_description', '出海第一站，搞定工具栈，一系列基于CloudFlare的开源工具 & 技术栈，旨在帮助独立开发者快速构建和发布SaaS产品。');

DROP TABLE IF EXISTS friend_links;
CREATE TABLE friend_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
DROP TABLE IF EXISTS item_tags;
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 项目-标签关联表（多对多）
CREATE TABLE item_tags (
  item_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (item_id, tag_id),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 用户反馈表
DROP TABLE IF EXISTS feedbacks;
CREATE TABLE feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, read
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 添加反馈功能开关设置
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('feedback_enabled', 'true');

-- 文章表
-- RSS Feeds Table
DROP TABLE IF EXISTS rss_feeds;
CREATE TABLE rss_feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, error, inactive
    show_in_list INTEGER DEFAULT 1, -- 0: hidden, 1: visible in frontend list
    last_sync INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Articles Table (Updated for RSS)
DROP TABLE IF EXISTS articles;
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    cover_image TEXT,
    original_url TEXT,
    guid TEXT, -- Unique ID from RSS feed
    source TEXT, -- Redundant but useful for display (Feed Name)
    status TEXT DEFAULT 'published', -- published, hidden
    views INTEGER DEFAULT 0,
    published_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
