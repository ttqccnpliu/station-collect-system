# 🚀 云端部署指南

## 方案一：Vercel + Railway（推荐，免费）

### 1. 部署后端到 Railway

#### 步骤：

1. **注册 Railway 账号**
   - 访问 https://railway.app/
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 连接您的 GitHub 账号
   - 选择项目仓库

3. **配置环境变量**
   在 Railway 项目设置中添加：
   ```
   SUPABASE_URL=https://qvgzkvtayjnrydzcvuil.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3prdnRheWpucnlkemN2dWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzE1NzEsImV4cCI6MjA4NzE0NzU3MX0.58w2sb1SNg-wbZDk2UyOE6vjkI504-jccYagJ_s7OCI
   NODE_ENV=production
   ```

4. **部署**
   - Railway 会自动检测 `railway.json` 并部署
   - 等待部署完成，获取域名（如：https://station-api.up.railway.app）

### 2. 部署前端到 Vercel

#### 步骤：

1. **注册 Vercel 账号**
   - 访问 https://vercel.com/
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 导入 GitHub 仓库
   - 框架预设选择 "Other"

3. **配置构建设置**
   - Build Command: 留空（静态文件无需构建）
   - Output Directory: `frontend`
   - Install Command: 留空

4. **配置环境变量**
   ```
   API_URL=https://your-railway-domain.up.railway.app
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成，获取域名（如：https://station-collect.vercel.app）

### 3. 更新前端 API 地址

修改 `frontend/station-list.html` 和 `frontend/station-collect-form.html` 中的 API 地址：

```javascript
// 开发环境
// const API_BASE = 'http://localhost:3000';

// 生产环境
const API_BASE = 'https://your-railway-domain.up.railway.app';
```

---

## 方案二：阿里云/腾讯云（国内访问快）

### 1. 购买云服务器

推荐配置：
- **ECS/云服务器**：1核2G，CentOS 7.9
- **带宽**：1-5Mbps
- **费用**：约 50-100元/月

### 2. 部署步骤

#### 安装 Node.js

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 部署后端

```bash
# 1. 上传代码到服务器
scp -r backend/ root@your-server-ip:/opt/station-collect/

# 2. 在服务器上安装依赖
cd /opt/station-collect/backend
npm install --production

# 3. 安装 PM2 进程管理器
npm install -g pm2

# 4. 启动服务
pm2 start server.js --name "station-api"
pm2 save
pm2 startup
```

#### 配置 Nginx

```bash
# 安装 Nginx
yum install nginx -y

# 配置反向代理
cat > /etc/nginx/conf.d/station.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /opt/station-collect/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启动 Nginx
systemctl start nginx
systemctl enable nginx
```

#### 配置 HTTPS（SSL证书）

```bash
# 使用 Certbot 免费证书
yum install certbot python2-certbot-nginx -y
certbot --nginx -d your-domain.com
```

---

## 方案三：Docker 部署（推荐生产环境）

### 1. 创建 Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NODE_ENV=production
    restart: always
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: always
```

### 3. 部署命令

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 🔧 环境变量配置

所有方案都需要配置以下环境变量：

```bash
# 数据库
SUPABASE_URL=https://qvgzkvtayjnrydzcvuil.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# 应用
NODE_ENV=production
PORT=3000

# 可选：日志级别
LOG_LEVEL=info
```

---

## 📊 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] 环境变量已配置
- [ ] 数据库表已创建
- [ ] RLS 策略已配置
- [ ] 前端 API 地址已更新
- [ ] HTTPS 证书已配置（生产环境）
- [ ] 域名已解析
- [ ] 健康检查接口可访问
- [ ] 表单提交测试通过

---

## 🆘 常见问题

### 1. CORS 错误

确保后端 CORS 配置正确：
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### 2. 数据库连接失败

检查：
- Supabase URL 和 Key 是否正确
- 数据库表是否存在
- RLS 策略是否允许访问

### 3. 前端无法访问 API

检查：
- 前端代码中的 API_BASE 是否更新为生产地址
- 后端服务是否正常运行
- 网络防火墙是否放行端口

---

## 💡 推荐方案选择

| 场景 | 推荐方案 | 预计费用 |
|------|----------|----------|
| 快速验证/测试 | Vercel + Railway | 免费 |
| 国内用户访问 | 阿里云/腾讯云 | 50-100元/月 |
| 生产环境/企业 | Docker + 云服务器 | 100-500元/月 |

需要我帮您详细配置其中某个方案吗？
