# Bot 小镇

俯视角像素小镇：走进不同类别的楼，认识 Grok Bot 模板，给它们打分，并把喜欢的导入到 Grok Bot。

## 操作

- 电脑：方向键或 WASD 移动，靠近门口或 Bot 后按 **E** / **空格**，或用鼠标点击。
- 手机：屏幕左下摇杆移动，右下「互动」按钮，也可点门口或 Bot。
- 评分保存在本机浏览器（localStorage），换设备或清缓存后不会同步。
- 「导入」会打开 `grokbot://` 链接，需要已安装 Grok Bot。

## 本地开发

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

静态文件在 `dist/`，可用任意静态托管（如 GitHub Pages）。
