# 作品管理后台部署说明

后台地址：`https://你的域名/admin.html`（如果 Cloudflare 已配置无扩展名路由，也可使用 `/admin`）。

这个后台使用 Cloudflare Pages Functions + D1 + R2：

- D1 保存作品标题、分类、说明、排序与发布状态。
- R2 保存上传的图片。
- `ADMIN_PASSWORD` 是后台登录密码，只保存在 Cloudflare 环境变量中。
- 原来写在代码里的作品会继续保留；后台发布的新作品会追加显示在对应分类页的“最新作品”区域。

## 1. 创建 D1 数据库

在 Cloudflare 控制台进入 **Workers & Pages → D1 SQL Database**，创建一个数据库，例如 `echo-portfolio`。

打开该数据库的 Console，把项目根目录的 `schema.sql` 内容完整执行一次。

然后进入当前 Pages 项目的 **Settings → Bindings → D1 database bindings**，添加：

- Variable name：`DB`
- D1 database：刚创建的 `echo-portfolio`

Production 和 Preview 环境建议都配置。

## 2. 创建 R2 图片存储桶

进入 **R2 Object Storage**，创建一个存储桶，例如 `echo-portfolio-media`。

回到 Pages 项目的 **Settings → Bindings → R2 bucket bindings**，添加：

- Variable name：`MEDIA`
- R2 bucket：刚创建的 `echo-portfolio-media`

不需要把 R2 存储桶设为公开；图片由本站的 `/api/portfolio/media/...` 安全读取。

## 3. 设置管理密码

在 Pages 项目的 **Settings → Variables and Secrets** 新增加密变量：

- Variable name：`ADMIN_PASSWORD`
- Value：使用一个只用于此后台的强密码，建议至少 16 位

不要把密码写入 Git 或前端环境变量。

## 4. 重新部署

以上绑定完成后，重新部署 Pages 项目。构建配置保持现有值：

- Build command：`pnpm run build`
- Build output directory：`dist`

部署完成后访问 `/admin.html` 登录。后台支持：

- 新增、编辑、删除作品
- 草稿 / 发布状态
- 选择作品分类与调整排序
- 一次批量上传最多 30 张图片
- 单张图片最大 20MB
- 调整图片顺序；第一张图片自动作为封面
- 删除单张图片或连同图片删除整个作品

## 使用建议

先创建作品并保存，再上传图片。上传完成后用“预览”检查前台详情页。作品设为草稿时，只会在后台出现，不会出现在公开页面。