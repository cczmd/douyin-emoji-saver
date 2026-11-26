# 发布验收记录 / Release verification

**版本 5.1.0 · 2026-11-26**

## 源码和发布规则

- 以已验收的 v5.1 为基线。去除脚本元数据、启动诊断日志和内嵌编码器后，正式版与基线的应用源码逐字节相同，包括界面样式、识别、转换逻辑、去重、下载和文件管理。
- 正式版保留原脚本名、命名空间、版本号、站点范围和权限。增加中英文列表元数据。内嵌编码器换为同一个 gifenc 1.0.3 npm 包的可读构建，脚本可独立安装。
- 核对了 Greasy Fork 对可读源码、内嵌依赖出处、脚本大小、语言、目标站点及版权的规则。两平台的实际发布和平台审核尚未进行。 [代码规则](https://greasyfork.org/en/help/code-rules) · [外部代码规则](https://greasyfork.org/en/help/external-scripts) · [元数据](https://greasyfork.org/en/help/meta-keys)

## Chrome 复验

- **真实抖音网页。** Chrome 158.0.8127.37 打开公开作品，加载其评论区。正式脚本以本地测试方式注入，悬浮球显示，面板可展开、用 Esc 关闭，刷新后仍正常，原生连续圆角可用。这次未取得可保存的真实评论表情，未打开私信或重新执行真实会话保存。
- **隔离测试。** 用同一 Chrome 和同一组自制图片分别执行基线与正式脚本。两者均通过启动、动态／静态筛选、相同图片去重、预览、多选、拖动吸附、位置记忆和面板关闭检查。两份 ZIP **逐字节相同**，其中三份 GIF 均可逐帧解码。WebP 转 GIF 和 APNG 转 GIF 的示例各为 3 帧，间隔分别为 100、140、230 毫秒。
- **截图。** 发布截图来自正式脚本在隔离 Chrome 页的实际渲染。测试图片为自制内容，截图中没有账号、评论或私信信息。

## English

The frozen app source is byte-identical to the accepted v5.1 baseline after excluding userscript metadata, the removed startup log, and the encoder bundle. The release embeds the readable build of the same gifenc 1.0.3 package.

On a real public Douyin page, Chrome 158 verified launcher startup, panel open and close, Esc, refresh, and native squircle support with the release file locally injected. The public smoke test did not yield a downloadable sticker or access a direct-message conversation. On isolated original sample media, baseline and release passed the same UI checks and produced byte-identical ZIP archives. The three-frame WebP and APNG samples each retained the 100/140/230 ms frame timing in the resulting GIF.

The promotional screenshots show the actual release interface on the isolated demo page. Platform submission and review have not been performed.
