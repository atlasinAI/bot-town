# Bot 小镇

俯视角像素小镇：走进不同类别的楼，认识 Grok Bot 模板，给它们打分，并把喜欢的导入到 Grok Bot。

**在线玩：** https://atlasinai.github.io/bot-town/

仓库：https://github.com/atlasinAI/bot-town

## 操作

- 电脑：方向键或 WASD 走路，靠近门口或 Bot 后按 **E** / **空格**，也可以直接点。
- 手机：用左下角摇杆移动，点右下角「互动」，或直接点门口和 Bot。
- 评分保存在本机浏览器（localStorage），换设备或清缓存后不会同步。
- 「导入」会打开 `grokbot://` 链接，需要已安装 Grok Bot。

## 楼与 Bot 数量

| 楼 | 人数 |
| --- | --- |
| 会计楼 | 7 |
| 销售楼 | 10 |
| 营销楼 | 10 |
| 办公楼 | 12 |
| 工程楼 | 8 |
| 生活楼 | 6 |

走进楼里看过的 Bot 会在「图鉴」里点亮；一栋楼全部看过会有集齐动画。没有输赢。

## 本地开发

```bash
npm install
npm run dev
```

构建（`vite` base 为 `./`，可放到任意静态托管）：

```bash
npm run build
```
