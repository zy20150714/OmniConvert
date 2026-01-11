# 万能转换工坊 - 生产环境部署指南

## 📋 部署准备

### 1. 服务器选择

| 服务商 | 推荐配置 | 价格参考 | 优势 |
|--------|----------|----------|------|
| 阿里云 | 2核4G 40G SSD | 约60元/月 | 国内访问速度快，稳定性好 |
| 腾讯云 | 2核4G 50G SSD | 约55元/月 | 同区域CDN加速，适合媒体处理 |
| AWS EC2 | t3.medium (2核4G) | 约70元/月 | 全球覆盖，适合国际访问 |
| 华为云 | 2核4G 40G SSD | 约50元/月 | 性价比高，技术支持好 |

**操作系统推荐**：Ubuntu 22.04 LTS（稳定、社区支持好）

### 2. 本地准备工作

```bash
# 克隆代码到本地（如果还没有的话）
git clone <your-repo-url>
cd OmniConvert-1

# 构建前端项目
cd frontend
npm install
npm run build  # 生成dist目录
```

## 🚀 服务器部署步骤

### 1. 连接服务器

```bash
ssh root@your-server-ip
# 或 ssh ubuntu@your-server-ip
```

### 2. 系统初始化

```bash
# 更新系统
apt update && apt upgrade -y

# 安装必要工具
apt install -y curl wget git unzip vim

# 创建项目目录
mkdir -p /opt/omniconvert
```

### 3. 安装 Node.js

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证安装
node -v  # v18.x.x
npm -v   # v9.x.x

# 安装 PM2 进程管理器
npm install -g pm2
```

### 4. 安装转换工具

```bash
# 1. 安装 FFmpeg
apt install -y ffmpeg

# 2. 安装 LibreOffice
sudo add-apt-repository ppa:libreoffice/ppa
apt update
apt install -y libreoffice libreoffice-writer libreoffice-calc libreoffice-impress

# 3. 安装 Pandoc
apt install -y pandoc

# 4. 安装 ImageMagick
apt install -y imagemagick

# 5. 安装额外的电子书转换工具
apt install -y calibre

# 6. 安装压缩文件处理工具
apt install -y unzip unrar p7zip-full

# 验证所有工具
ffmpeg -version
office --version
pandoc --version
convert --version
```

### 5. 部署后端服务

```bash
# 上传后端代码到服务器（或使用 git clone）
# 方法1：使用 scp 上传
scp -r backend/* root@your-server-ip:/opt/omniconvert/backend/

# 方法2：直接在服务器克隆
cd /opt/omniconvert
git clone <your-repo-url> .

# 安装后端依赖
cd /opt/omniconvert/backend
npm install

# 创建必要的临时目录
mkdir -p tmp/uploads tmp/outputs
chmod 777 tmp/ -R

# 配置环境变量
cat > .env << EOF
PORT=3000
API_BASE_URL=http://your-domain.com
MAX_FILE_SIZE=104857600
CHUNK_SIZE=10485760
MAX_CONCURRENT_TASKS=3
EOF

# 使用 PM2 启动后端服务
pm run build  # 如果有构建脚本
pm run start

# 或直接使用 PM2 启动
pm start

# 配置 PM2 自启动
pm startup
pm save
```

### 6. 部署前端代码

```bash
# 上传前端构建文件（或直接在服务器构建）
scp -r frontend/dist/* root@your-server-ip:/opt/omniconvert/frontend/dist/

# 或在服务器构建
cd /opt/omniconvert/frontend
npm install
npm run build
```

### 7. 安装和配置 Nginx

```bash
# 安装 Nginx
apt install -y nginx

# 创建 Nginx 配置文件
cat > /etc/nginx/conf.d/omniconvert.conf << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    location / {
        root /opt/omniconvert/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 文件下载代理
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        proxy_set_header Host $host;
    }

    location /outputs {
        proxy_pass http://localhost:3000/outputs;
        proxy_set_header Host $host;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
    }
}
EOF

# 验证 Nginx 配置
nginx -t

# 重启 Nginx 服务
systemctl restart nginx

# 设置 Nginx 开机自启
systemctl enable nginx
```

### 8. 配置 HTTPS（Let's Encrypt）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请 SSL 证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 验证证书自动续期
certbot renew --dry-run

# 配置证书自动续期
# 证书会自动续期，无需手动操作
```

### 9. 配置防火墙

```bash
# 查看防火墙状态
systemctl status ufw

# 如果未启用，启用防火墙
systemctl enable ufw
systemctl start ufw

# 允许必要端口
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS

# 查看防火墙规则
ufw status
```

## 🔧 生产环境优化

### 1. 后端优化

```bash
# 配置 PM2 多进程
pm start -i max

# 调整 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=2048"  # 2GB

# 配置日志切割
npm install pm2-logrotate -g
pm set pm2-logrotate:max_size 10M
pm set pm2-logrotate:retain 7
```

### 2. 前端优化

```bash
# 启用 Gzip 压缩（Nginx 已默认配置）
# 配置缓存策略
cat >> /etc/nginx/conf.d/omniconvert.conf << EOF

# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
}
EOF

# 重启 Nginx
systemctl restart nginx
```

### 3. 安全配置

```bash
# 禁用 root 远程登录
vim /etc/ssh/sshd_config
# 将 PermitRootLogin yes 改为 PermitRootLogin no
# 重启 SSH 服务
systemctl restart sshd

# 创建普通用户
useradd -m -s /bin/bash omniconvert
passwd omniconvert
# 授予 sudo 权限
usermod -aG sudo omniconvert

# 配置 Fail2ban 防止暴力破解
apt install -y fail2ban
# 配置 Fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 📊 监控和日志

### 1. 监控服务

```bash
# 安装监控工具
apt install -y htop iotop vnstat

# 安装 Prometheus + Grafana（高级监控）
# 参考：https://prometheus.io/docs/prometheus/latest/installation/
```

### 2. 日志管理

```bash
# 查看后端日志
npm logs

# 实时查看日志
npm logs --follow

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
```

## 🐛 常见问题排查

### 1. 服务无法启动

```bash
# 查看 PM2 日志
npm logs

# 查看端口占用
lsof -i :3000
# 或
netstat -tuln | grep 3000

# 检查文件权限
ls -la /opt/omniconvert/
```

### 2. 转换失败

```bash
# 检查转换工具是否正常
ffmpeg -version
soffice --version

# 查看转换日志
cat /opt/omniconvert/backend/tmp/logs/*.log
```

### 3. 上传文件过大

```bash
# 调整 Nginx 上传限制
cat >> /etc/nginx/nginx.conf << EOF
http {
    client_max_body_size 100M;
}
EOF

# 重启 Nginx
systemctl restart nginx

# 调整 Node.js 上传限制
# 在 server.js 中修改 multer 配置
```

## 🔄 自动部署脚本

创建一个自动部署脚本 `deploy.sh`：

```bash
#!/bin/bash

echo "=== 开始部署万能转换工坊 ==="

# 拉取最新代码
echo "1. 拉取最新代码..."
cd /opt/omniconvert
git pull

# 安装依赖
echo "2. 安装依赖..."
cd backend
npm install

cd ../frontend
npm install

# 构建前端
echo "3. 构建前端..."
npm run build

# 重启后端服务
echo "4. 重启后端服务..."
cd ../backend
npm restart

echo "=== 部署完成！ ==="
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📌 部署清单

✅ 服务器配置完成
✅ Node.js 安装完成
✅ 转换工具安装完成
✅ 后端服务部署完成
✅ 前端代码部署完成
✅ Nginx 配置完成
✅ HTTPS 配置完成
✅ 防火墙配置完成
✅ 监控日志配置完成
✅ 安全配置完成

## 🌐 访问网站

- 前端访问：https://your-domain.com
- 后端 API：https://your-domain.com/api
- 健康检查：https://your-domain.com/api/health

## 📞 技术支持

如果您在部署过程中遇到任何问题，可以通过以下方式获取帮助：

1. 查看项目日志
2. 检查服务器状态
3. 参考官方文档
4. 联系技术支持

---

祝您部署顺利！万能转换工坊将为您提供高效、稳定的文件转换服务！