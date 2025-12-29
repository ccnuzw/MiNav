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
