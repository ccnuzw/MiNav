-- 添加用户反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 添加反馈功能开关设置
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('feedback_enabled', 'true');
