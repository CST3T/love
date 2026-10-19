# 卿美静 · 心动告白

一个适配 Android 手机横屏游玩的互动告白网页，使用 Vite 构建为静态网站。

## 游戏操作

- 页面在竖屏时会显示横屏入口提示；点击“尝试自动横屏”或开始游戏时，支持的 Android 浏览器会尝试进入全屏并锁定横屏。若浏览器不允许，请开启手机的“自动旋转”并横过手机后再开始。
- 按住屏幕左下角的左右键操控数码女孩，按右下角按钮跳跃。电脑也可用方向键或 A/D 移动、空格跳跃。
- 点击“开始横屏冒险”后会播放原创的纯爱氛围轻柔旋律；每抵达一座传送门都会切换到该站专属旋律，并以淡入淡出衔接，最终站另有温暖的告白旋律。音乐持续到结束或离开页面；可随时点击右上角音乐按钮静音或恢复。音乐从开始按钮点击后启动，以符合手机浏览器的自动播放限制。
- 沿流星星轨走到各个发光传送门，即可打开问答、告白、相册等板块；读完后点“回到星轨继续”前往下一站。
- 照片只在当前页面预览。问卷答案只保存在当前设备的浏览器本地，不会自动发给任何人。
- 每座星球前有两处需要跳跃越过的星星/流星障碍；碰到障碍会停下并提示跳跃。完成最后一站后，会全屏显示“我爱你”并出现留言框。

## 配置微信留言通知（PushPlus）

没有配置通知服务时，留言仍会保存在女友的手机浏览器里，页面会明确提示“微信通知还未配置”，不会假装已发送。要实际发送到微信，需要 PushPlus 账号/token 和 Cloudflare Workers：

1. 在 PushPlus 获取 token 并确认已绑定微信。
2. 在 Cloudflare 登录 Wrangler 并部署 Worker（Wrangler 配置在 `cloudflare/wrangler.toml`）：
   ```sh
   npx wrangler login
   npx wrangler deploy --config cloudflare/wrangler.toml
   npx wrangler secret put PUSHPLUS_TOKEN --config cloudflare/wrangler.toml
   npx wrangler secret put ALLOWED_ORIGIN --config cloudflare/wrangler.toml
   ```
   按提示输入 PushPlus token 和网站的准确源，例如 `https://用户名.github.io`（不要带仓库路径或末尾斜杠）。也可以在 Cloudflare Worker → Settings → Variables and Secrets 设置这两个值。
4. Worker 成功部署后，复制它的 `https://...workers.dev` 地址。
5. 本地测试时将地址写在 `.env` 的 `VITE_WECHAT_NOTIFY_URL`。GitHub Pages 部署则在仓库 **Settings → Secrets and variables → Actions → Variables** 新建 `VITE_WECHAT_NOTIFY_URL`，填入 Worker URL；推送一次代码触发重新部署。
6. 用手机发送测试留言，确认 PushPlus 的微信通知到达。

留言通过 PushPlus 第三方服务转发到微信；通知接口只允许配置的站点 Origin，PushPlus token 只保存在 Cloudflare，不会打包进网页。发送失败会在页面提示，且留言仍留在当前设备本地。不要将真实 token 提交到 GitHub。

## 本地预览

需要 Node.js 20 或更高版本：

```sh
npm ci
npm run dev
```

## 发布并获得手机访问网址

1. 将项目推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment** 中将来源设为 **GitHub Actions**。
3. 等待仓库 **Actions** 中的部署工作流成功。GitHub 会显示公开访问网址，通常为 `https://<用户名>.github.io/<仓库名>/`。
4. 用 Android 手机点击该网址，即可在浏览器中打开网页；无需安装应用。建议使用 Chrome 并保持联网。

每次推送到 `main` 后，网站会自动重新部署。此工作区尚未关联 GitHub 仓库，因此需要仓库所有者完成推送和首次 Pages 设置后，才能得到真实的公网网址。

## 答案与照片隐私

- 问卷答案只保存在填写者当前浏览器的本地存储中，不会自动发送给网站作者或其他人。
- 照片只在当前页面本地预览，不会上传；刷新页面后需要重新选择。
- 请勿把个人照片、通知令牌或其他私密资料提交到公开仓库。
