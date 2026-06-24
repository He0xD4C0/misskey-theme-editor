# 🎨 Misskey Theme Editor

基于 Misskey 主题系统的独立可视化主题编辑器，支持实时预览。

## 功能

- **可视化编辑** — 57 个标准主题属性按分组展示，支持颜色选择器与文本输入
- **实时预览** — 模拟 Misskey UI（侧边栏、顶栏、帖子卡片、按钮、开关、输入框等）
- **亮/暗切换** — 一键切换基础主题，自动适配默认值
- **预设主题** — 内置 10 个预设（默认亮/暗、咖啡、鲜艳、植物绿、樱花粉、星空、未来、冰蓝、柿子）
- **JSON5 导入/导出** — 兼容 Misskey 主题格式，支持文件导出
- **一键复制** — 生成仅包含差异属性的精简代码
- **属性重置** — 每个属性可一键恢复为基础主题值

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或构建生产版本
# npm run build
```

启动后访问 `http://localhost:5173`。

## 打包为桌面应用

本项目支持打包为 Windows、macOS 和 Linux 桌面应用。

### 安装依赖

```bash
npm install

# 开发模式运行 Electron
npm run electron:dev
```

这会同时启动 Vite 开发服务器和 Electron 应用。

### 打包应用


```bash
# Windows (.exe)
npm run electron:build:win

# macOS (.dmg)
npm run electron:build:mac

# Linux (.AppImage)
npm run electron:build:linux
```
或
```bash
# 打包所有平台
npm run electron:build
```

打包完成后，应用文件会在 `release/` 目录中生成。

### 项目结构

```
misskey-theme-editor/
├── index.html              # 入口 HTML
├── assects/
│   ├── icon.svg            # 应用图标
│   └── theme/              # 主题资源
├── package.json
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
├── electron-main.ts        # Electron 主进程
├── electron-builder.json   # electron-builder 打包配置
├── src/
│   ├── main.ts             # 应用入口
│   ├── theme-engine.ts     # 主题解析与渲染引擎
│   ├── state.ts            # 应用状态管理
│   ├── io.ts               # 主题文件导入/导出
│   ├── events.ts           # 事件监听与处理
│   ├── helpers.ts          # 通用工具函数
│   ├── ui-utils.ts         # UI 辅助函数
│   ├── style.css           # 全局样式
│   ├── vite-env.d.ts       # Vite 类型声明
│   └── components/
│       ├── top-bar.ts      # 顶部工具栏
│       ├── preview.ts      # Misskey UI 实时预览
│       ├── property-editor.ts # 属性编辑面板
│       ├── code-panel.ts   # 主题代码面板
│       ├── preset-menu.ts  # 预设主题选择菜单
│       └── theme-info.ts   # 主题元信息编辑
├── dist/                   # 构建输出（生成）
└── release/                # 打包后的应用（生成）
```

### 理论支持平台

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+
- ✅ Debian 10+
- ✅ Fedora 32+

## 打包配置详解

### electron-builder.json 主要配置

- **appId**: 应用唯一标识
- **productName**: 应用显示名称
- **win.target**: Windows 打包格式
  - `portable`: 便携版（无需安装）
- **mac.target**: macOS 打包格式
  - `dmg`: 磁盘映像
  - `zip`: 压缩包
- **linux.target**: Linux 打包格式
  - `AppImage`: 通用格式
  - `deb`: Debian/Ubuntu 包

## 常见问题

### Q: 打包后应用无法启动？
A: 检查以下几点：
1. 确保 `dist/index.html` 存在（运行 `npm run build`）
2. 检查控制台错误信息
3. 确认 `base: './'` 在 `vite.config.ts` 中

### Q: 如何减小应用体积？
A: 
1. 使用 `asar: true`（默认启用）
2. 优化图片资源
3. 移除不必要的依赖

## Misskey 主题格式

主题为 JSON5 文件，结构如下：

```json5
{
  id: "uuid",
  name: "My Theme",
  author: "@me",
  base: "light",   // "light" 或 "dark"，决定继承的基础主题
  props: {
    accent: "#e36749",           // 字面颜色
    bg: "#fff",
    panel: ":lighten<3<@bg",    // 函数调用：lighten 3% 的 bg 值
    accentedBg: ":alpha<0.15<@accent", // alpha 15% 的 accent
    fg: "@fg",                   // 引用其他属性
    panelBorder: '" solid 1px var(--MI_THEME-divider)', // 原始 CSS
    $myConst: "#ff0",            // $ 开头为常量（不输出 CSS）
  }
}
```

### 值类型

| 前缀 | 类型 | 示例 |
|---|---|---|
| `#` / `rgb()` | 字面颜色 | `#86b300` |
| `@` | 属性引用 | `@accent` |
| `$` | 常量引用 | `$myConst` |
| `:<func>` | 函数调用 | `:darken<3<@bg` |
| `"` | 原始 CSS | `" solid 1px ...` |

### 颜色函数

可链式调用，如 `:saturate<30<:hue<30<@accent`：

| 函数 | 说明 | 示例 |
|---|---|---|
| `darken` | 加深 | `:darken<10<@bg` |
| `lighten` | 减淡 | `:lighten<3<@panel` |
| `alpha` | 设置透明度 | `:alpha<0.5<@accent` |
| `hue` | 色相旋转 | `:hue<20<@accent` |
| `saturate` | 饱和度 | `:saturate<30<@fg` |

## 技术栈

- **TypeScript** + **Vite**
- **tinycolor2** — 颜色解析与变换
- **json5** — 主题文件解析

## 致谢

主题引擎移植自 [Misskey](https://github.com/misskey-dev/misskey) 的 `packages/frontend-shared/js/theme.ts`。

## 相关文档

- [Electron 官方文档](https://www.electronjs.org/)
- [electron-builder 文档](https://www.electron.build/)
- [Vite 官方文档](https://vitejs.dev/)
- [Misskey](https://github.com/misskey-dev/misskey)

## License

AGPL-3.0
