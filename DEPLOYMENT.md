# 部署指南 (Deployment Guide)

## 方案一：静态网站托管（推荐）

这是最简单的部署方式，适用于 Vercel、Netlify、GitHub Pages 等平台。

### 1. 构建生产版本

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建完成后，会在 `dist` 目录生成静态文件。

### 2. 部署到各平台

#### 部署到 Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

**环境变量设置：**
在 Vercel 项目设置中添加：
- `GEMINI_API_KEY`: 你的 Gemini API 密钥

#### 部署到 Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod --dir=dist
```

**环境变量设置：**
在 Netlify 项目设置中添加：
- `GEMINI_API_KEY`: 你的 Gemini API 密钥

#### 部署到 GitHub Pages

1. 修改 `vite.config.ts`，添加 base 路径：
```typescript
export default defineConfig({
  base: '/你的仓库名/',
  // ... 其他配置
})
```

2. 构建并部署：
```bash
npm run build
# 将 dist 目录推送到 gh-pages 分支
```

---

## 方案二：使用 Nginx/Apache 托管

### 1. 构建项目

```bash
npm install
npm run build
```

### 2. 配置 Nginx

创建配置文件 `/etc/nginx/sites-available/covercraft`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/covercraft/dist;
    index index.html;
    
    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 启用配置并重启

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/covercraft /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 上传文件

```bash
# 将 dist 目录上传到服务器
scp -r dist/* user@your-server:/var/www/covercraft/dist/
```

---

## 方案三：使用 Docker 部署

### 1. 创建 Dockerfile

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. 创建 nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 3. 构建并运行

```bash
# 构建镜像
docker build -t covercraft .

# 运行容器
docker run -d -p 80:80 --name covercraft-app covercraft
```

---

## 方案四：宝塔面板部署

### 1. 在服务器上构建

```bash
# SSH 登录服务器
cd /www/wwwroot/your-site

# 上传代码或 git clone
git clone your-repo-url .

# 安装依赖
npm install

# 构建
npm run build
```

### 2. 在宝塔面板配置

1. 创建网站，选择"静态网站"
2. 网站目录指向：`/www/wwwroot/your-site/dist`
3. 运行目录设置为：`/`
4. 添加伪静态规则（用于 SPA）：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 重要提示 ⚠️

### 环境变量配置

由于这是纯前端应用，API 密钥会暴露在客户端。**强烈建议**：

1. **不要直接在前端使用 API 密钥**
2. **创建后端 API 代理**来保护密钥

#### 推荐方案：创建后端代理

创建一个简单的 Node.js 后端：

```javascript
// server.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/genai';

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/process-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;
    // 调用 Gemini API
    const result = await genAI.generateContent({...});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('API server running on port 3001'));
```

然后修改前端代码，调用你的后端 API 而不是直接调用 Gemini。

---

## 快速开始（最简单方式）

如果你只是想快速部署测试：

```bash
# 1. 构建
npm run build

# 2. 预览构建结果
npm run preview

# 3. 使用任何静态文件服务器
npx serve dist
```

然后访问显示的地址即可！

---

## 需要帮助？

如果在部署过程中遇到问题，请检查：
- ✅ Node.js 版本是否 >= 18
- ✅ 环境变量是否正确配置
- ✅ 构建是否成功完成
- ✅ 服务器防火墙是否开放相应端口
