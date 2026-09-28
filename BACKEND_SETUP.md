# 作品管理后台

后台地址：`https://echolin.com.cn/admin`

正式站点使用阿里云 Linux 自托管后端：

- `server/portfolio_api.py`：仅监听 `127.0.0.1:8787` 的 Python API。
- SQLite：保存作品标题、分类、说明、顺序、发布状态和回收站状态。
- `/var/lib/echo-portfolio/media`：保存后台上传的图片，不进入 Git 仓库。
- Nginx：转发 `/api/portfolio`，并从 `/portfolio-media/` 只读提供图片。
- systemd：以 `www` 用户运行 `echo-portfolio.service`，开机自动启动。

## 后台功能

- 新增、编辑、排序作品
- 草稿 / 发布状态
- 一次最多上传 10 张图片，单张最大 25MB
- 调整图片顺序，第一张自动作为封面
- 删除单张图片
- 删除作品时先进入回收站
- 从回收站恢复作品，或永久删除作品与图片

## 安全设计

- 管理密码只以 PBKDF2-SHA256 哈希保存在服务器 `/etc/echo-portfolio/config.json`。
- 首次访问后台时使用一次性设置码创建密码；完成后设置码立即从服务器配置中删除。
- 登录 Cookie 设置 `HttpOnly`、`Secure`、`SameSite=Strict`，12 小时失效。
- 登录失败有 15 分钟速率限制。
- 写操作校验请求来源，只接受 `https://echolin.com.cn`。
- API 不对公网开放端口，只由本机 Nginx 反向代理。
- 上传文件会按文件签名验证，只允许 JPEG、PNG、WebP、GIF 和 AVIF。

## 服务器目录

```text
/opt/echo-portfolio/portfolio_api.py
/etc/echo-portfolio/config.json
/var/lib/echo-portfolio/portfolio.db
/var/lib/echo-portfolio/media/
/etc/systemd/system/echo-portfolio.service
/www/server/panel/vhost/nginx/echolin.com.cn.conf
```

## 运维命令

```bash
systemctl status echo-portfolio
journalctl -u echo-portfolio -n 100 --no-pager
systemctl restart echo-portfolio
nginx -t
```

SQLite 数据库与 `media` 目录需要和网站一起定期备份。部署时不要覆盖 `/var/lib/echo-portfolio`，因此日后更新前端不会丢失后台作品。

## 代码中的 Cloudflare Functions

`functions/` 和 `schema.sql` 是先前 Cloudflare Pages 方案的兼容实现。阿里云正式站点不使用它们；保留这些文件不会影响 Nginx 部署。

原有写在 `src/main.jsx` 中的静态作品继续保留。后台发布的新作品显示在对应分类页的“最新作品”区域，并拥有独立详情页。