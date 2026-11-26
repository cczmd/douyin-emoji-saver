# 安装与使用 / Installation and use

## 中文

### 安装

1. 在桌面 Chrome 安装并启用 [Tampermonkey](https://www.tampermonkey.net/)。在扩展详情开启 **允许用户脚本**（Chrome 138+）。如果网站访问权限设为指定网站，为 `https://www.douyin.com` 开启访问。 [Tampermonkey 说明](https://www.tampermonkey.net/faq.php?locale=en&q=Q209)
2. 从 Greasy Fork 点击 **安装此脚本**，或者在 GitHub 打开 [脚本文件](../douyin-emoji-saver.user.js) 并选 **Raw**。如果浏览器直接显示源码，打开 Tampermonkey 管理面板，选 **添加新脚本**，将该文件的完整内容粘贴进编辑器，保存并启用。
3. 打开或刷新抖音网页。鼠标移到评论或私信里的可识别表情上可使用悬停保存，点击悬浮球可打开表情列表。

### 保存

- 首次使用保存功能时，请在 Chrome 文件夹选择器中选择专用的 `抖音表情包` 文件夹。可以先在下载目录下创建它。脚本会在所选根目录下创建 `动态表情` 和 `静态表情` 子文件夹。
- 也可以在面板「设置」中更换目录，或使用「下载 ZIP」。
- 按照浏览器提示重新授权。Chrome 的文件夹访问权限及自动下载设置仍适用。

### 悬浮球未出现

确认 Tampermonkey 和脚本均已启用，扩展可访问当前抖音站点，而且已开启允许用户脚本。修改 Chrome 权限后刷新页面。同名同命名空间的本地 5.1.0 与公开版版本号相同，Tampermonkey 可能需要你手动确认重新安装。

## English

### Install

1. Install and enable [Tampermonkey](https://www.tampermonkey.net/) in desktop Chrome. Under the extension details, enable **Allow User Scripts** in Chrome 138+. If extension access is restricted, allow it on `https://www.douyin.com`. [Tampermonkey instructions](https://www.tampermonkey.net/faq.php?locale=en&q=Q209)
2. Use **Install this script** on Greasy Fork or open [the script](../douyin-emoji-saver.user.js) in GitHub's **Raw** view. If Chrome shows source text, create a new script in the Tampermonkey dashboard, paste the complete file, save, and enable it.
3. Open or reload Douyin. Use the floating button to browse stickers or hover over a recognized sticker in a comment or direct message.

### Save

- Create or choose a dedicated folder named `抖音表情包` in Chrome's folder picker. You can place it in Downloads. The script creates `动态表情` (animated) and `静态表情` (static) subfolders inside the chosen folder.
- Use **设置** (Settings) to change the folder or **下载 ZIP** to download an archive.
- Chrome may ask for permission again. Chrome's folder access and automatic download settings still apply.

### Floating button missing

Check that the extension and script are enabled, site access includes Douyin, and **Allow User Scripts** is on. Reload Douyin after changing extension permissions. A local 5.1.0 installation has the same name, namespace, and version as the release, so Tampermonkey may prompt for a manual reinstall.
