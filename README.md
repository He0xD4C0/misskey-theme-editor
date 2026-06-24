# 🎨 Misskey Theme Editor

基于 Misskey 主题系统的独立可视化主题编辑器，支持实时预览。

## 功能

- **可视化编辑** — 主题属性按分组展示，支持颜色选择器与文本输入
- **实时预览** — 模拟 Misskey UI（侧边栏、顶栏、帖子卡片、按钮、开关、输入框等）
- **亮/暗切换** — 一键切换基础主题，可选择是否重置背景等参数
- **预设主题** — 从 `assects/theme/` 加载外部 JSON5 主题文件
- **JSON5 导入/导出** — 兼容 Misskey 主题格式，支持文件导入/导出
- **一键复制** — 生成精简的主题代码
- **属性重置** — 每个属性可一键恢复为基础主题值
- **桌面应用** — 支持打包为 Windows/macOS/Linux 桌面应用（Electron）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问 `http://localhost:5173`。

## 打包桌面应用

```bash
# Windows 便携版
npm run electron:build:win

# macOS（需要 macOS 环境）
npm run electron:build:mac

# Linux（需要 Linux 环境）
npm run electron:build:linux
```

打包完成后，应用文件会在 `release/` 目录中生成。

> **注意**：跨平台打包需要在对应操作系统上执行（Windows 打包 Windows 版，macOS 打包 macOS 版等）。

### 项目结构

```
misskey-theme-editor/
├── index.html              # 入口 HTML
├── electron-main.ts        # Electron 主进程
├── electron-builder.json   # electron-builder 打包配置
├── tsconfig.json           # 前端 TypeScript 配置
├── tsconfig.electron.json  # Electron 主进程 TypeScript 配置
├── vite.config.ts          # Vite 构建配置
├── assects/
│   ├── icon.svg            # 应用图标
│   └── theme/              # 预设主题 JSON5 文件
├── src/
│   ├── main.ts             # 应用入口
│   ├── theme-engine.ts     # 主题解析与编译引擎
│   ├── state.ts            # 应用状态管理
│   ├── io.ts               # 主题文件导入/导出
│   ├── events.ts           # 事件总线
│   ├── helpers.ts          # 辅助函数
│   ├── ui-utils.ts         # UI 工具函数
│   ├── preset-loader.ts    # 外部主题加载器
│   ├── style.css           # 全局样式
│   └── components/
│       ├── top-bar.ts      # 顶部工具栏
│       ├── preview.ts      # Misskey UI 实时预览
│       ├── property-editor.ts # 属性编辑面板
│       ├── code-panel.ts   # 主题代码面板
│       ├── preset-menu.ts  # 预设主题选择菜单
│       └── theme-info.ts   # 主题元信息编辑
├── dist/                   # 构建输出（gitignore）
└── release/                # 打包后的应用（gitignore）
```

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
  }
}
```

### 支持的表达式

| 表达式 | 说明 | 示例 |
|--------|------|------|
| `@prop` | 引用其他属性 | `@accent` |
| `:alpha<X<@prop` | 设置透明度 | `:alpha<0.15<@accent` |
| `:lighten<X<@prop` | 变亮 | `:lighten<3<@bg` |
| `:darken<X<@prop` | 变暗 | `:darken<3<@fg` |
| `:hue<X<@prop` | 色相旋转 | `:hue<30<@accent` |

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
