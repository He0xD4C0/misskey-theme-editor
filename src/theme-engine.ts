/**
 * Misskey Theme Engine — 完整移植自 packages/frontend-shared/js/theme.ts
 * 支持主题解析、编译、验证，以及完整的表达式语言
 */

import tinycolor from 'tinycolor2';
import JSON5 from 'json5';

// ─── Types ───────────────────────────────────────────────

export type Theme = {
  id: string;
  name: string;
  author: string;
  desc?: string;
  base?: 'dark' | 'light';
  kind?: 'dark' | 'light'; // legacy
  props: Record<string, string>;
};

export type CompiledTheme = Record<string, string>;

// ─── 57 标准主题属性（来自 _light.json5）──────────────────

export const themeProps: string[] = [
  'accent', 'accentedBg', 'love', 'focus',
  'bg', 'fg', 'fgHighlighted', 'fgOnAccent', 'fgOnWhite',
  'divider', 'indicator',
  'panel', 'panelHighlight', 'panelHeaderBg', 'panelHeaderFg', 'panelBorder',
  'windowHeader', 'popup', 'shadow',
  'header', 'navBg', 'navFg', 'navActive', 'navIndicator',
  'pageHeaderBg', 'pageHeaderFg',
  'link', 'hashtag', 'mention', 'mentionMe', 'renote',
  'modalBg',
  'scrollbarHandle', 'scrollbarHandleHover',
  'dateLabelFg',
  'infoBg', 'infoFg', 'infoWarnBg', 'infoWarnFg',
  'folderHeaderBg', 'folderHeaderHoverBg',
  'buttonBg', 'buttonHoverBg', 'buttonGradateA', 'buttonGradateB',
  'switchBg', 'switchOffBg', 'switchOffFg', 'switchOnBg', 'switchOnFg',
  'inputBorder', 'inputBorderHover',
  'badge', 'messageBg',
  'success', 'error', 'warn',
  'codeString', 'codeNumber', 'codeBoolean',
  'deckBg', 'htmlThemeColor',
];

// ─── 属性分组（用于 UI 显示）──────────────────────────────

export const themePropGroups: { label: string; props: string[]; labelZh: string }[] = [
  {
    label: 'Core Colors',
    labelZh: '核心颜色',
    props: ['accent', 'accentedBg', 'love', 'focus', 'bg', 'fg', 'fgHighlighted', 'fgOnAccent', 'fgOnWhite'],
  },
  {
    label: 'Dividers & Indicators',
    labelZh: '分隔线 & 指示器',
    props: ['divider', 'indicator'],
  },
  {
    label: 'Panels',
    labelZh: '面板',
    props: ['panel', 'panelHighlight', 'panelHeaderBg', 'panelHeaderFg', 'panelBorder', 'windowHeader', 'popup', 'shadow'],
  },
  {
    label: 'Header & Navigation',
    labelZh: '头部 & 导航',
    props: ['header', 'navBg', 'navFg', 'navActive', 'navIndicator', 'pageHeaderBg', 'pageHeaderFg'],
  },
  {
    label: 'Content',
    labelZh: '内容',
    props: ['link', 'hashtag', 'mention', 'mentionMe', 'renote', 'modalBg', 'messageBg', 'dateLabelFg'],
  },
  {
    label: 'Scrollbar',
    labelZh: '滚动条',
    props: ['scrollbarHandle', 'scrollbarHandleHover'],
  },
  {
    label: 'Info Boxes',
    labelZh: '信息框',
    props: ['infoBg', 'infoFg', 'infoWarnBg', 'infoWarnFg'],
  },
  {
    label: 'Folders',
    labelZh: '文件夹',
    props: ['folderHeaderBg', 'folderHeaderHoverBg'],
  },
  {
    label: 'Buttons',
    labelZh: '按钮',
    props: ['buttonBg', 'buttonHoverBg', 'buttonGradateA', 'buttonGradateB'],
  },
  {
    label: 'Switches',
    labelZh: '开关',
    props: ['switchBg', 'switchOffBg', 'switchOffFg', 'switchOnBg', 'switchOnFg'],
  },
  {
    label: 'Inputs',
    labelZh: '输入框',
    props: ['inputBorder', 'inputBorderHover'],
  },
  {
    label: 'Status Colors',
    labelZh: '状态颜色',
    props: ['badge', 'success', 'error', 'warn'],
  },
  {
    label: 'Code',
    labelZh: '代码',
    props: ['codeString', 'codeNumber', 'codeBoolean'],
  },
  {
    label: 'Other',
    labelZh: '其他',
    props: ['deckBg', 'htmlThemeColor'],
  },
];

// ─── 属性中文名称映射 ───────────────────────────────────

export const propNameZh: Record<string, string> = {
  accent: '强调色', accentedBg: '强调色背景', love: '喜欢/点赞', focus: '焦点',
  bg: '背景色', fg: '前景色', fgHighlighted: '高亮前景', fgOnAccent: '强调色上文字', fgOnWhite: '白色上文字',
  divider: '分隔线', indicator: '指示器',
  panel: '面板', panelHighlight: '面板高亮', panelHeaderBg: '面板头部背景', panelHeaderFg: '面板头部文字', panelBorder: '面板边框',
  windowHeader: '窗口头部', popup: '弹窗', shadow: '阴影',
  header: '顶栏', navBg: '导航背景', navFg: '导航文字', navActive: '导航激活', navIndicator: '导航指示器',
  pageHeaderBg: '页面头部背景', pageHeaderFg: '页面头部文字',
  link: '链接', hashtag: '话题标签', mention: '提及', mentionMe: '提及我', renote: '转发',
  modalBg: '模态框背景', messageBg: '消息背景', dateLabelFg: '日期标签',
  scrollbarHandle: '滚动条', scrollbarHandleHover: '滚动条悬停',
  infoBg: '信息背景', infoFg: '信息文字', infoWarnBg: '警告背景', infoWarnFg: '警告文字',
  folderHeaderBg: '文件夹头部', folderHeaderHoverBg: '文件夹头部悬停',
  buttonBg: '按钮背景', buttonHoverBg: '按钮悬停', buttonGradateA: '按钮渐变A', buttonGradateB: '按钮渐变B',
  switchBg: '开关背景', switchOffBg: '开关关背景', switchOffFg: '开关关前景', switchOnBg: '开关开背景', switchOnFg: '开关开前景',
  inputBorder: '输入框边框', inputBorderHover: '输入框边框悬停',
  badge: '徽章', success: '成功', error: '错误', warn: '警告',
  codeString: '代码字符串', codeNumber: '代码数字', codeBoolean: '代码布尔',
  deckBg: 'Deck 背景', htmlThemeColor: 'HTML 主题色',
};

// ─── 5 种值类型描述 ─────────────────────────────────────

export type ThemeValueKind = 'color' | 'refProp' | 'refConst' | 'func' | 'rawCss' | 'empty';

export function classifyThemeValue(val: string): ThemeValueKind {
  if (!val) return 'empty';
  if (val[0] === '@') return 'refProp';
  if (val[0] === '$') return 'refConst';
  if (val[0] === ':') return 'func';
  if (val[0] === '"') return 'rawCss';
  return 'color';
}

// ─── 编译引擎 ───────────────────────────────────────────

const MAX_THEME_REFERENCE_DEPTH = 8;

function getThemeReferenceColor(
  theme: Theme,
  key: string,
  stack: string[],
  depth: number,
): tinycolor.Instance {
  if (depth >= MAX_THEME_REFERENCE_DEPTH) {
    throw new Error('Theme reference limit exceeded');
  }
  if (stack.includes(key)) {
    throw new Error('Theme contains circular references');
  }
  const nextValue = theme.props[key];
  if (typeof nextValue !== 'string') {
    throw new Error(`Theme references missing property: ${key}`);
  }
  return getColor(theme, nextValue, [...stack, key], depth + 1);
}

function getColor(
  theme: Theme,
  val: string,
  stack: string[] = [],
  depth = 0,
): tinycolor.Instance {
  if (val[0] === '@') {
    return getThemeReferenceColor(theme, val.substring(1), stack, depth);
  } else if (val[0] === '$') {
    return getThemeReferenceColor(theme, val, stack, depth);
  } else if (val[0] === ':') {
    if (depth >= MAX_THEME_REFERENCE_DEPTH) {
      throw new Error('Theme reference limit exceeded');
    }
    const parts = val.split('<');
    const funcTxt = parts.shift();
    const argTxt = parts.shift();

    if (funcTxt && argTxt) {
      const func = funcTxt.substring(1);
      const arg = parseFloat(argTxt);
      const color = getColor(theme, parts.join('<'), stack, depth + 1);

      switch (func) {
        case 'darken': return color.darken(arg);
        case 'lighten': return color.lighten(arg);
        case 'alpha': return color.setAlpha(arg);
        case 'hue': return color.spin(arg);
        case 'saturate': return color.saturate(arg);
      }
    }
  }
  return tinycolor(val);
}

export function compile(theme: Theme): CompiledTheme {
  const props = {} as CompiledTheme;

  for (const [k, v] of Object.entries(theme.props)) {
    if (k.startsWith('$')) continue; // 忽略常量
    try {
      props[k] = v.startsWith('"') ? v.replace(/^"\s*/, '') : getColor(theme, v).toRgbString();
    } catch {
      // 编译失败时保留原始值
      props[k] = v;
    }
  }

  return Object.fromEntries(
    Object.entries(props).filter(([key]) => themeProps.includes(key)),
  ) as CompiledTheme;
}

/** 编译单个属性值为 CSS 颜色字符串 */
export function compileValue(theme: Theme, value: string): string {
  if (!value) return '';
  if (value.startsWith('"')) return value.substring(1).trim();
  try {
    return getColor(theme, value).toRgbString();
  } catch {
    return value;
  }
}

// ─── 验证 ───────────────────────────────────────────────

export function validateTheme(theme: Record<string, any>): boolean {
  if (theme.id == null || typeof theme.id !== 'string') return false;
  if (theme.name == null || typeof theme.name !== 'string') return false;
  if (theme.base == null || !['light', 'dark'].includes(theme.base)) return false;
  if (theme.props == null || typeof theme.props !== 'object') return false;
  return true;
}

// ─── 解析 JSON5 ─────────────────────────────────────────

export function parseThemeCode(code: string): Theme {
  let theme: any;
  try {
    theme = JSON5.parse(code);
  } catch {
    throw new Error('JSON5 解析失败');
  }
  if (!validateTheme(theme)) {
    throw new Error('主题格式无效');
  }
  return theme as Theme;
}

// ─── 生成 ID ────────────────────────────────────────────

export function genId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── 基础主题定义 ───────────────────────────────────────

export const LIGHT_BASE: Theme = {
  id: 'light',
  name: 'Light',
  author: 'syuilo',
  desc: 'Default light theme',
  kind: 'light',
  props: {
    accent: '#86b300',
    accentedBg: ':alpha<0.15<@accent',
    love: '#dd2e44',
    focus: ':alpha<0.3<@accent',
    bg: '#fff',
    fg: '#5f5f5f',
    fgHighlighted: ':darken<3<@fg',
    fgOnAccent: '#fff',
    fgOnWhite: '#333',
    divider: 'rgba(0, 0, 0, 0.1)',
    indicator: '@accent',
    panel: ':lighten<3<@bg',
    panelHighlight: ':darken<3<@panel',
    panelHeaderBg: ':lighten<3<@panel',
    panelHeaderFg: '@fg',
    panelBorder: '" solid 1px var(--MI_THEME-divider)',
    windowHeader: ':alpha<0.85<@panel',
    popup: ':lighten<3<@panel',
    shadow: 'rgba(0, 0, 0, 0.1)',
    header: ':alpha<0.7<@panel',
    navBg: '@panel',
    navFg: '@fg',
    navActive: '@accent',
    navIndicator: '@indicator',
    pageHeaderBg: '@bg',
    pageHeaderFg: '@fg',
    link: '#44a4c1',
    hashtag: '#ff9156',
    mention: '@accent',
    mentionMe: '@mention',
    renote: '#229e82',
    modalBg: 'rgba(0, 0, 0, 0.3)',
    scrollbarHandle: 'rgba(0, 0, 0, 0.2)',
    scrollbarHandleHover: 'rgba(0, 0, 0, 0.4)',
    dateLabelFg: '@fg',
    infoBg: '#e5f5ff',
    infoFg: '#72818a',
    infoWarnBg: '#fff0db',
    infoWarnFg: '#8f6e31',
    folderHeaderBg: 'rgba(0, 0, 0, 0.05)',
    folderHeaderHoverBg: 'rgba(0, 0, 0, 0.1)',
    buttonBg: ':darken<5<@panel',
    buttonHoverBg: ':darken<10<@panel',
    buttonGradateA: '@accent',
    buttonGradateB: ':hue<20<@accent',
    switchBg: 'rgba(0, 0, 0, 0.15)',
    switchOffBg: 'rgba(0, 0, 0, 0.1)',
    switchOffFg: '@panel',
    switchOnBg: '@accent',
    switchOnFg: '@fgOnAccent',
    inputBorder: 'rgba(0, 0, 0, 0.1)',
    inputBorderHover: 'rgba(0, 0, 0, 0.2)',
    badge: '#31b1ce',
    messageBg: '@bg',
    success: '#86b300',
    error: '#ec4137',
    warn: '#ecb637',
    codeString: '#b98710',
    codeNumber: '#0fbbbb',
    codeBoolean: '#62b70c',
    deckBg: ':darken<3<@bg',
    htmlThemeColor: '@bg',
  },
};

export const DARK_BASE: Theme = {
  id: 'dark',
  name: 'Dark',
  author: 'syuilo',
  desc: 'Default dark theme',
  kind: 'dark',
  props: {
    accent: '#86b300',
    accentedBg: ':alpha<0.15<@accent',
    love: '#dd2e44',
    focus: ':alpha<0.3<@accent',
    bg: '#000',
    fg: '#dadada',
    fgHighlighted: ':lighten<3<@fg',
    fgOnAccent: '#fff',
    fgOnWhite: '#333',
    divider: 'rgba(255, 255, 255, 0.1)',
    indicator: '@accent',
    panel: ':lighten<3<@bg',
    panelHighlight: ':lighten<3<@panel',
    panelHeaderBg: ':lighten<3<@panel',
    panelHeaderFg: '@fg',
    panelBorder: '" solid 1px var(--MI_THEME-divider)',
    windowHeader: ':alpha<0.85<@panel',
    popup: ':lighten<3<@panel',
    shadow: 'rgba(0, 0, 0, 0.3)',
    header: ':alpha<0.7<@panel',
    navBg: '@panel',
    navFg: '@fg',
    navActive: '@accent',
    navIndicator: '@indicator',
    pageHeaderBg: '@bg',
    pageHeaderFg: '@fg',
    link: '#44a4c1',
    hashtag: '#ff9156',
    mention: '@accent',
    mentionMe: '@mention',
    renote: '#229e82',
    modalBg: 'rgba(0, 0, 0, 0.5)',
    scrollbarHandle: 'rgba(255, 255, 255, 0.2)',
    scrollbarHandleHover: 'rgba(255, 255, 255, 0.4)',
    dateLabelFg: '@fg',
    infoBg: '#253142',
    infoFg: '#fff',
    infoWarnBg: '#42321c',
    infoWarnFg: '#ffbd3e',
    folderHeaderBg: 'rgba(255, 255, 255, 0.05)',
    folderHeaderHoverBg: 'rgba(255, 255, 255, 0.1)',
    buttonBg: ':lighten<5<@panel',
    buttonHoverBg: ':lighten<10<@panel',
    buttonGradateA: '@accent',
    buttonGradateB: ':hue<20<@accent',
    switchBg: 'rgba(255, 255, 255, 0.15)',
    switchOffBg: 'rgba(255, 255, 255, 0.1)',
    switchOffFg: ':alpha<0.8<@fg',
    switchOnBg: '@accentedBg',
    switchOnFg: '@accent',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputBorderHover: 'rgba(255, 255, 255, 0.2)',
    badge: '#31b1ce',
    messageBg: '@bg',
    success: '#86b300',
    error: '#ec4137',
    warn: '#ecb637',
    codeString: '#ffb675',
    codeNumber: '#cfff9e',
    codeBoolean: '#c59eff',
    deckBg: '#000',
    htmlThemeColor: '@bg',
  },
};

// ─── 预设主题 ───────────────────────────────────────────

export interface PresetTheme {
  name: string;
  nameZh: string;
  theme: Partial<Theme>;
}

export const presetThemes: PresetTheme[] = [
  {
    name: 'Default Light',
    nameZh: '默认亮色',
    theme: { base: 'light', props: { accent: '#86b300', bg: '#fff', fg: '#5f5f5f' } },
  },
  {
    name: 'Default Dark',
    nameZh: '默认暗色',
    theme: { base: 'dark', props: { accent: '#86b300', bg: '#000', fg: '#dadada' } },
  },
  {
    name: 'Coffee Light',
    nameZh: '咖啡亮色',
    theme: { base: 'light', props: { accent: '#9f8989', bg: '#f5f3f3', fg: '#7f6666' } },
  },
  {
    name: 'Vivid Light',
    nameZh: '鲜艳亮色',
    theme: { base: 'light', props: { accent: '#e36749', bg: '#fff', fg: '#555' } },
  },
  {
    name: 'Botanical',
    nameZh: '植物绿',
    theme: { base: 'light', props: { accent: '#5faa5f', bg: '#f0f5ee', fg: '#586d5b' } },
  },
  {
    name: 'Cherry',
    nameZh: '樱花粉',
    theme: { base: 'light', props: { accent: '#e84d83', bg: '#faf0f3', fg: '#84667d' } },
  },
  {
    name: 'Astro Dark',
    nameZh: '星空暗色',
    theme: { base: 'dark', props: { accent: '#606df7', bg: '#1a1b2e', fg: '#d1d2e4' } },
  },
  {
    name: 'Future Dark',
    nameZh: '未来暗色',
    theme: { base: 'dark', props: { accent: '#34c9a9', bg: '#1a2525', fg: '#d1e4e4' } },
  },
  {
    name: 'Ice Dark',
    nameZh: '冰蓝暗色',
    theme: { base: 'dark', props: { accent: '#34a1c9', bg: '#192330', fg: '#c0d5e4' } },
  },
  {
    name: 'Persimmon Dark',
    nameZh: '柿子暗色',
    theme: { base: 'dark', props: { accent: '#e36749', bg: '#231a17', fg: '#e4d1c0' } },
  },
];
