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

# 构建生产版本
npm run build
```

启动后访问 `http://localhost:5173`。

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

## License

MIT
