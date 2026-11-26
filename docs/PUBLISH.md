# 正式发布指南 / Publishing guide

## 1. 准备账号

- **GitHub**：在注册页选择公开用户名并验证邮箱。公开提交可使用 GitHub 提供的 noreply 地址。 [注册 GitHub](https://github.com/signup) · [邮件隐私设置](https://github.com/settings/emails)
- **Greasy Fork**：打开注册页，选择公开显示名，按页面提示完成注册与验证。 [注册 Greasy Fork](https://greasyfork.org/en/users/sign_up)

## 2. 准备 GitHub 仓库

1. 创建 `douyin-emoji-saver` 仓库。可以先设为 **Private** 审阅，用 GitHub Desktop、Git 或网页上传本发布目录内的文件，保留 `assets`、`docs`、`licenses` 和 `vendor` 的结构。 [新建仓库](https://github.com/new) · [上传文件](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
2. 确认项目自己的许可和公开版权名称。可按 [许可证建议](../LICENSE-PROPOSAL.md) 补充根目录许可；保留依赖声明和对应源码。
3. 核对公开简介和截图后，将审核通过的仓库设为公开。进入 **Releases → Draft a new release**，选择标签 `v5.1.0`，用 [更新日志](../CHANGELOG.md) 作发布说明，并附上 `douyin-emoji-saver.user.js`。检查草稿后即可发布。 [GitHub Release 指南](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

## 3. 准备 Greasy Fork 条目

1. 登录并进入 [发布新脚本](https://greasyfork.org/en/scripts/new)。贴入或上传 [douyin-emoji-saver.user.js](../douyin-emoji-saver.user.js) 的完整内容，作为用户脚本发布。
2. 用 [列表文案](GREASY-FORK-LISTING.md) 补充中文和英文说明。添加 GitHub 仓库的第三方声明及对应源码页面链接，以及 `assets` 中两张演示截图。保留脚本内的依赖来源及许可证。
3. 检查名称、版本号、目标站点及安装预览。在发布条目中以 Greasy Fork 上的脚本作为本站安装入口。提交后，可在干净的 Chrome 配置中从公开条目安装一次。 [代码规则](https://greasyfork.org/en/help/code-rules) · [元数据规则](https://greasyfork.org/en/help/meta-keys)

## English summary

Create and verify both accounts. Prepare the `douyin-emoji-saver` repository and confirm the license of the original application code. Publish a GitHub release tagged `v5.1.0` with the complete userscript attached. Post the same file on Greasy Fork and add the bilingual description, demo screenshots, and source/notice links. Greasy Fork's listing should install the copy it hosts.
