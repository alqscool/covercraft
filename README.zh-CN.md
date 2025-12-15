<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 运行和部署你的 AI Studio 应用

本项目包含了在本地运行应用所需的一切。

在 AI Studio 中查看你的应用: https://ai.studio/apps/drive/1M-ZvAT24D02VUeZhxKfiXlZq5YckRpzK

## 本地运行

**前置要求：** Node.js


1. 安装依赖：
   `npm install`
2. 在 [.env.local](.env.local) 中设置你的 Gemini API 密钥 `GEMINI_API_KEY`
3. 运行应用：
   `npm run dev`

## 部署到生产环境


### 快速部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建完成后，`dist` 目录包含了所有可以部署的静态文件。

### 部署平台

本项目支持部署到多个平台：

- **Vercel**（推荐）- 零配置部署
- **Netlify** - 简单快速
- **GitHub Pages** - 免费托管
- **Nginx/Apache** - 自建服务器
- **Docker** - 容器化部署
- **宝塔面板** - 可视化管理

📖 **详细部署指南请查看：[DEPLOYMENT.md](DEPLOYMENT.md)**

> ⚠️ **安全提示**：生产环境建议使用后端 API 代理来保护 Gemini API 密钥，避免直接在前端暴露。详见部署文档。
