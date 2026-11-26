# 隐私政策 / Privacy policy

适用版本 / Applies to version **5.1.0**

## 中文

- **处理内容。** 脚本从当前抖音网页的评论或私信区域识别已渲染的图片候选，读取对应的图片资源，用于预览、去重、转换和保存。候选可能来自你当前有权访问的私信。识别会检查图片 URL、尺寸和附近元素的 HTML 属性，例如 alt、title 和 aria-label。脚本不提取聊天正文、联系人列表或登录凭据，也不把聊天对象姓名写入保存记录。
- **网络。** 读取图片时会向资源地址发出 GET 请求。标准网页请求遵循浏览器的 Cookie、跨域和引用来源规则。同源请求可以附带浏览器处理的会话信息。Tampermonkey 的回退请求设置了 `anonymous: true`，权限声明涵盖 `douyin.com`、`douyinpic.com`、`douyincdn.com`、`byteimg.com`、`bytedance.com`、`snssdk.com` 和 `ibytedtos.com`。脚本没有自有上传端点、分析埋点或第三方转换服务。
- **本地存储。** 悬浮球位置写入浏览器 Local Storage。目录句柄、保存序号和标记已保存的 SHA-256 哈希保存在抖音页面来源的 IndexedDB。已读图片和预览对象在页面内存中处理，保存或导出的文件写入你授权的目录或通过浏览器下载。
- **目录授权。** Chrome 按网站来源管理文件访问权限，授权属于抖音页面来源。建议选择只用于此脚本保存的独立文件夹。可以在 Chrome 的抖音网站权限中撤销目录授权，或清除抖音站点数据以删除本地记录。清除站点数据也可能影响登录状态及抖音自身设置。已下载的文件可在本地文件管理器中处理。
- **平台操作。** 若通过 Greasy Fork 或 GitHub 安装，平台和 Tampermonkey 可能按各自的政策处理安装或更新请求。

## English

- **What is processed.** The script looks for image candidates already rendered in Douyin comments or direct messages and reads the image resources for preview, deduplication, conversion, and saving. This can include stickers visible in direct messages you can access. Recognition checks the image URL, dimensions, and nearby HTML attributes such as alt, title, and aria-label. It does not extract chat bodies, contact lists, or login credentials, and does not store participant names in save records.
- **Network.** Reading an image issues a GET request to its resource URL. Standard browser requests follow Chrome's cookie, cross-origin, and referrer rules. Same-origin requests may carry browser-managed session information. The Tampermonkey fallback specifies `anonymous: true`. The declared hosts are `douyin.com`, `douyinpic.com`, `douyincdn.com`, `byteimg.com`, `bytedance.com`, `snssdk.com`, and `ibytedtos.com`. The script includes no upload endpoint, analytics, or third-party conversion service.
- **Local data.** The floating button position is stored in Local Storage. The folder handle, save sequence, and saved image SHA-256 hashes are stored in IndexedDB for the Douyin page origin. Fetched images and preview objects are processed in page memory. Files you save go to the selected folder or through Chrome downloads.
- **Folder access.** Chrome manages file access for the website origin, which in this case is Douyin. Choose a dedicated folder. You can revoke folder access in Chrome's site permissions or clear Douyin site data to delete local records. Clearing site data may also affect your Douyin session and settings. Manage downloaded files using your file manager.
- **Platform services.** If you install through Greasy Fork or GitHub, those services and Tampermonkey may process installation or update requests under their own policies.
