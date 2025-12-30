# MiNav - Cloudflare 导航仪表盘

MiNav 是一个基于 Cloudflare 技术栈构建的轻量级、高性能导航仪表盘。它允许您通过现代化的响应式界面管理和展示您最喜爱的工具、文档和资源链接。

## ✨ 特性

- **Cloudflare 原生**: 基于 Cloudflare Pages, D1 (数据库), 和 KV (键值存储) 构建。
- **后台管理**: 完整的增删改查 (CRUD) 功能，支持项目、分类、标签和友情链接管理。
- **用户交互**: 
  - **工具提交**: 访客可提交新工具，支持数学验证码防护，管理员后台审核。网站设置中可一键开启/关闭该功能。
  - **意见反馈**: 内置意见反馈表单，支持验证码，管理员后台统一查看和管理用户建议。
- **RSS 订阅中心 (New)**:
  - **双模式引擎**: 支持 **本地模式** (数据库缓存，快速响应) 和 **实时模式** (在线直接抓取，最新内容) 全局一键切换。
  - **精细化管理**: 支持按订阅源控制是否在前台列表显示，防止刷屏。
  - **智能解析**: 自动解析 RSS/Atom 格式，支持封面图提取（部分源）。
- **个性化定制**:
  - **站点 LOGO**: 支持自定义站点左上角 LOGO（图片 URL 或 FontAwesome 图标）。
  - **动态设置**: 后台直接管理站点名称、标语、主页文本、默认图标及功能开关。
  - **一键匹配图标**: 后台项目管理支持“一键匹配图标”，自动从 Unavatar/Google 等源获取项目 LOGO。
- **标签系统**: 为项目添加多彩标签，支持自定义颜色和前端筛选功能。
- **友情链接**: 在页面底部展示友情链接，支持自动获取图标或自定义图标显示。
- **移动端适配**:
  - **响应式设计**: 从前台到后台完全适配移动设备。
  - **移动端后台**: 后台管理在手机端自动切换为卡片视图，操作更便捷。
  - **极致体验**: 针对订阅源、项目列表等复杂数据，移动端采用优化的卡片式布局，信息展示更清晰。
- **图标生态**: 
  - **图标选择**: 内置图标预览，支持 FontAwesome 和 Material Symbols。
  - **默认图标**: 可配置项目默认图标。
- **暗色模式**: 支持亮色/暗色主题自动切换或手动控制。
- **安全**: 后台管理区域提供基础的会话认证保护。

## 🛠 技术栈

- **前端**: Vue 3, Vite, Tailwind CSS
- **后端**: Cloudflare Pages Functions
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare KV (会话管理)

## 📋 前置要求

- [Node.js](https://nodejs.org/) (v16.13.0 或更高版本)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)
- 一个 Cloudflare 账号

## 💻 本地开发

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd MiNav
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **设置本地 D1 数据库**
   初始化本地 D1 数据库结构：
   ```bash
   npx wrangler d1 execute MINAV_DB --local --file=./schema.sql
   ```

4. **启动开发服务器**
   需要开启两个终端窗口分别启动后端和前端：

   **终端 1 (后端 API):**
   启动 Cloudflare Pages 模拟环境，提供后端 API 支持：
   ```bash
   npx wrangler pages dev .
   ```
   *此服务默认运行在 `http://localhost:8788`*

   **终端 2 (前端页面):**
   启动 Vite 开发服务器，提供前端页面热更支持：
   ```bash
   npm run dev
   ```
   *此服务默认运行在 `http://localhost:5173`*

   > **注意**: 开发时请访问 `http://localhost:5173`，这是您的开发预览地址。前端会自动将 API 请求代理到后端端口 (8788)。

5. **⚠️ 初始化管理员 (必须执行)**
   **方式一：登录界面初始化 (推荐)**
   访问开发环境登录页面 `http://localhost:5173/login`，点击下方的 **"初始化系统用户"** 按钮即可一键创建。

   **方式二：通过 API 地址初始化**
   直接访问以下地址：
   ```
   http://localhost:5173/api/setup
   ```
   *(或者 `http://localhost:8788/api/setup`)*
   
   **默认凭据:**
   - **用户名**: `admin`
   - **密码**: `admin`
   
   > ⚠️ **重要提示**: 如果登录时提示 401 Unauthorized，请确保已执行此初始化步骤。

## 🚀 部署

### 1. 创建 Cloudflare 资源

**D1 数据库:**
```bash
npx wrangler d1 create minav-db
```
*请记录输出中的 `database_id`。*

**KV 命名空间:**
```bash
npx wrangler kv:namespace create minav-kv
```
*请记录输出中的 `id`。*

### 2. 配置 `wrangler.toml`

使用上一步获取的 ID 更新您的 `wrangler.toml` 文件：

```toml
name = "minav"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "MINAV_DB"
database_name = "minav-db"
database_id = "<YOUR_DATABASE_ID>"

[[kv_namespaces]]
binding = "MINAV_KV"
id = "<YOUR_KV_ID>"
```

### 3. 初始化远程数据库

将数据库结构应用到您的生产环境 D1 数据库：
```bash
npx wrangler d1 execute minav-db --remote --file=./schema.sql
```

### 4. 部署到 Cloudflare Pages

#### 方式一：使用 CLI 部署 (推荐)

构建并部署应用：
```bash
npm run build
npx wrangler pages deploy dist
```

#### 方式二：连接 Git 仓库 (手工部署)

1. **创建项目**:
   - 登录 Cloudflare Dashboard -> Pages。
   - 点击 "Create a project" -> "Connect to Git"。
   - 选择您的仓库 (MiNav)。

2. **配置构建设置**:
   - **Project name**: `minav` (或任意名称)
   - **Production branch**: `main`
   - **Framework preset**: `Vue` (或 None)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

3. **保存并部署**:
   - 点击 "Save and Deploy"。
   - **注意**: 首次部署可能会失败，因为数据库和 KV 尚未绑定，这是正常的。

4. **绑定资源 (关键步骤)**:
   - 进入项目页面 -> **Settings** -> **Functions**。
   - 滚动到 **D1 Database Bindings** 部分：
     - Variable name: `MINAV_DB`
     - D1 database: 选择您之前创建的 `minav-db`
   - 滚动到 **KV Namespace Bindings** 部分：
     - Variable name: `MINAV_KV`
     - KV Namespace: 选择您之前创建的 `minav-kv`
   - 点击保存。

5. **重新部署**:
   - 进入 **Deployments** 选项卡。
   - 找到最新的部署 -> 点击三个点 -> **Retry deployment**。
   - 等待部署成功。

### 5. ⚠️ 初始化管理员 (必须执行)

部署完成后，需要初始化管理员账户才能登录后台。

**方式一：登录界面初始化 (推荐)**
访问您的项目登录页面 `https://<your-project>.pages.dev/login`，点击下方的 **"初始化系统用户"** 按钮。

**方式二：通过 API 地址初始化**
访问以下地址：
```
https://<your-project>.pages.dev/api/setup
```

**默认凭据:**
- **用户名**: `admin`
- **密码**: `admin`

> ⚠️ **安全提示**: 首次登录后请立即修改默认密码！

## 📄 许可证

MIT
