/**
 * Misskey Theme Editor — 主应用入口
 * 集成可视化编辑器 + 实时预览
 */

import {
  type Theme, type CompiledTheme,
  themeProps, themePropGroups, propNameZh,
  LIGHT_BASE, DARK_BASE, presetThemes,
  compile, compileValue, validateTheme, parseThemeCode, genId,
  classifyThemeValue,
} from './theme-engine';
import JSON5 from 'json5';
import tinycolor from 'tinycolor2';
import './style.css';

// ─── State ───────────────────────────────────────────────

let currentTheme: Theme = {
  id: genId(),
  name: 'My Theme',
  author: '@me',
  base: 'light',
  props: { ...LIGHT_BASE.props, accent: '#86b300' },
};

let expandedGroups = new Set<string>(['Core Colors', 'Panels', 'Header & Navigation']);

// ─── Helpers ─────────────────────────────────────────────

function getBaseTheme(base: 'light' | 'dark'): Theme {
  return base === 'dark' ? DARK_BASE : LIGHT_BASE;
}

function getMergedTheme(): Theme {
  const base = getBaseTheme(currentTheme.base ?? 'light');
  return {
    ...currentTheme,
    props: { ...base.props, ...currentTheme.props },
  };
}

function getCompiledTheme(): CompiledTheme {
  return compile(getMergedTheme());
}

/** 获取属性的解析颜色（用于颜色选择器显示） */
function getResolvedColor(propKey: string): string {
  const merged = getMergedTheme();
  const val = merged.props[propKey];
  if (!val) return '#000000';
  if (val.startsWith('"')) return '#000000';
  try {
    return compileValue(merged, val);
  } catch {
    return '#000000';
  }
}

/** 从 rgba(...) 中提取 hex（用于颜色选择器的 value） */
function toPickerColor(propKey: string): string {
  const resolved = getResolvedColor(propKey);
  const tc = tinycolor(resolved);
  if (!tc.isValid()) return '#000000';
  return tc.toHexString();
}

/** 判断颜色是否为"透明"值（包含 alpha） */
function hasAlpha(propKey: string): boolean {
  const val = currentTheme.props[propKey] ?? '';
  return val.includes('alpha') || val.includes('rgba');
}

// ─── DOM 构建 ────────────────────────────────────────────

function buildApp() {
  const app = document.getElementById('app')!;
  app.innerHTML = '';

  // 顶栏
  app.appendChild(buildTopBar());

  // 主区域
  const main = el('div', 'main');

  // 左侧编辑器
  const editor = el('div', 'editor-panel');
  editor.appendChild(buildThemeInfoSection());
  editor.appendChild(buildPropertyEditor());
  main.appendChild(editor);

  // 右侧预览
  const preview = el('div', 'preview-panel');
  preview.appendChild(buildPreview());
  main.appendChild(preview);

  app.appendChild(main);

  // 底部代码面板
  app.appendChild(buildCodePanel());

  // 初始渲染
  updatePreview();
}

function buildTopBar(): HTMLElement {
  const bar = el('div', 'topbar');

  // Logo
  const logo = el('div', 'topbar-logo');
  logo.innerHTML = '🎨 Misskey Theme Editor';
  bar.appendChild(logo);

  // 操作按钮
  const actions = el('div', 'topbar-actions');

  // 预设下拉
  const presetBtn = createButton('预设主题', 'ti ti-palette', () => showPresetMenu(presetBtn));
  actions.appendChild(presetBtn);

  // 导入
  actions.appendChild(createButton('导入 JSON5', 'ti ti-upload', importTheme));

  // 导出
  actions.appendChild(createButton('导出 JSON5', 'ti ti-download', exportTheme));

  // 复制到剪贴板
  actions.appendChild(createButton('复制代码', 'ti ti-copy', copyCode));

  bar.appendChild(actions);

  return bar;
}

function buildThemeInfoSection(): HTMLElement {
  const section = el('div', 'editor-section');

  const title = el('h3', 'section-title');
  title.textContent = '主题信息';
  section.appendChild(title);

  const form = el('div', 'info-form');

  // 主题名
  const nameGroup = el('div', 'form-group');
  const nameLabel = el('label'); nameLabel.textContent = '主题名称';
  const nameInput = el('input') as HTMLInputElement;
  nameInput.type = 'text';
  nameInput.value = currentTheme.name;
  nameInput.addEventListener('input', () => {
    currentTheme.name = nameInput.value;
    updateCodePanel();
  });
  nameGroup.append(nameLabel, nameInput);
  form.appendChild(nameGroup);

  // 作者
  const authorGroup = el('div', 'form-group');
  const authorLabel = el('label'); authorLabel.textContent = '作者';
  const authorInput = el('input') as HTMLInputElement;
  authorInput.type = 'text';
  authorInput.value = currentTheme.author;
  authorInput.addEventListener('input', () => {
    currentTheme.author = authorInput.value;
    updateCodePanel();
  });
  authorGroup.append(authorLabel, authorInput);
  form.appendChild(authorGroup);

  // 描述
  const descGroup = el('div', 'form-group');
  const descLabel = el('label'); descLabel.textContent = '描述';
  const descInput = el('input') as HTMLInputElement;
  descInput.type = 'text';
  descInput.value = currentTheme.desc ?? '';
  descInput.addEventListener('input', () => {
    currentTheme.desc = descInput.value || undefined;
    updateCodePanel();
  });
  descGroup.append(descLabel, descInput);
  form.appendChild(descGroup);

  // 基础主题切换
  const baseGroup = el('div', 'form-group');
  const baseLabel = el('label'); baseLabel.textContent = '基础主题';
  const baseSwitch = el('div', 'base-switch');

  const lightBtn = createButton('☀️ 亮色', '', () => switchBase('light'));
  const darkBtn = createButton('🌙 暗色', '', () => switchBase('dark'));

  function updateBaseButtons() {
    lightBtn.classList.toggle('active', currentTheme.base === 'light');
    darkBtn.classList.toggle('active', currentTheme.base === 'dark');
  }
  updateBaseButtons();

  (window as any)._updateBaseButtons = updateBaseButtons;

  baseSwitch.append(lightBtn, darkBtn);
  baseGroup.append(baseLabel, baseSwitch);
  form.appendChild(baseGroup);

  section.appendChild(form);
  return section;
}

function switchBase(base: 'light' | 'light' | 'dark') {
  const oldBase = currentTheme.base;
  currentTheme.base = base;

  // 只重置非用户手动修改过的属性（简单实现：重置全部为基础值）
  const baseTheme = getBaseTheme(base);
  // 保留用户修改过的核心颜色
  const userAccent = currentTheme.props.accent;
  const userBg = currentTheme.props.bg;
  const userFg = currentTheme.props.fg;

  currentTheme.props = { ...baseTheme.props };

  if (userAccent) currentTheme.props.accent = userAccent;
  if (userBg) currentTheme.props.bg = userBg;
  if (userFg) currentTheme.props.fg = userFg;

  (window as any)._updateBaseButtons?.();
  buildApp();
}

function buildPropertyEditor(): HTMLElement {
  const section = el('div', 'editor-section');

  const title = el('h3', 'section-title');
  title.textContent = '属性编辑';
  section.appendChild(title);

  for (const group of themePropGroups) {
    const groupEl = el('div', 'prop-group');

    const header = el('div', 'prop-group-header');
    const arrow = el('span', 'prop-group-arrow');
    arrow.textContent = expandedGroups.has(group.label) ? '▼' : '▶';
    const label = el('span');
    label.textContent = `${group.labelZh} (${group.label})`;
    const count = el('span', 'prop-group-count');
    count.textContent = `${group.props.length} 个属性`;
    header.append(arrow, label, count);

    header.addEventListener('click', () => {
      if (expandedGroups.has(group.label)) {
        expandedGroups.delete(group.label);
      } else {
        expandedGroups.add(group.label);
      }
      buildApp();
    });

    groupEl.appendChild(header);

    if (expandedGroups.has(group.label)) {
      const propsEl = el('div', 'prop-group-props');
      for (const propKey of group.props) {
        propsEl.appendChild(buildPropRow(propKey));
      }
      groupEl.appendChild(propsEl);
    }

    section.appendChild(groupEl);
  }

  return section;
}

function buildPropRow(propKey: string): HTMLElement {
  const row = el('div', 'prop-row');

  const val = currentTheme.props[propKey] ?? '';
  const kind = classifyThemeValue(val);

  // 属性名
  const nameEl = el('div', 'prop-name');
  const nameMain = el('span', 'prop-name-main');
  nameMain.textContent = propKey;
  const nameZhEl = el('span', 'prop-name-zh');
  nameZhEl.textContent = propNameZh[propKey] ?? '';
  nameEl.append(nameMain, nameZhEl);
  row.appendChild(nameEl);

  // 值类型标签
  const kindBadge = el('span', `value-kind kind-${kind}`);
  kindBadge.textContent = {
    color: '颜色', refProp: '引用', refConst: '常量',
    func: '函数', rawCss: '原始CSS', empty: '空',
  }[kind] ?? kind;
  row.appendChild(kindBadge);

  // 颜色预览 + 编辑
  const editArea = el('div', 'prop-edit');

  // 颜色预览块
  const colorPreview = el('div', 'prop-color-preview');
  try {
    const resolved = getResolvedColor(propKey);
    colorPreview.style.backgroundColor = resolved;
    // 显示透明棋盘格背景
    if (tinycolor(resolved).getAlpha() < 1) {
      colorPreview.classList.add('has-alpha');
    }
  } catch {
    colorPreview.style.backgroundColor = '#ccc';
  }
  editArea.appendChild(colorPreview);

  if (kind === 'color' || kind === 'func') {
    // 颜色选择器
    const picker = el('input') as HTMLInputElement;
    picker.type = 'color';
    picker.value = toPickerColor(propKey);
    picker.className = 'color-picker';
    picker.addEventListener('input', () => {
      currentTheme.props[propKey] = picker.value;
      onPropChanged();
    });
    editArea.appendChild(picker);
  }

  // 文本输入
  const input = el('input') as HTMLInputElement;
  input.type = 'text';
  input.value = val;
  input.className = 'prop-input';
  input.placeholder = '输入值...';
  input.addEventListener('input', () => {
    if (input.value) {
      currentTheme.props[propKey] = input.value;
    } else {
      delete currentTheme.props[propKey];
    }
    onPropChanged();
    // 更新颜色预览
    try {
      const resolved = getResolvedColor(propKey);
      colorPreview.style.backgroundColor = resolved;
    } catch {}
  });
  editArea.appendChild(input);

  // 重置按钮
  const resetBtn = el('button', 'prop-reset-btn') as HTMLButtonElement;
  resetBtn.textContent = '↺';
  resetBtn.title = '重置为基础主题值';
  const baseTheme = getBaseTheme(currentTheme.base ?? 'light');
  const baseVal = baseTheme.props[propKey] ?? '';
  const isModified = val !== baseVal;
  if (!isModified) {
    resetBtn.disabled = true;
    resetBtn.style.opacity = '0.3';
  }
  resetBtn.addEventListener('click', () => {
    if (baseVal) {
      currentTheme.props[propKey] = baseVal;
    } else {
      delete currentTheme.props[propKey];
    }
    buildApp();
  });
  editArea.appendChild(resetBtn);

  row.appendChild(editArea);

  return row;
}

function onPropChanged() {
  updatePreview();
  updateCodePanel();
}

// ─── Preview ─────────────────────────────────────────────

function buildPreview(): HTMLElement {
  const section = el('div', 'editor-section');

  const title = el('h3', 'section-title');
  title.textContent = '实时预览';
  section.appendChild(title);

  const previewContainer = el('div', 'preview-container');
  previewContainer.id = 'preview-container';

  // Misskey-like UI preview
  const mkPreview = el('div', 'mk-preview');
  mkPreview.id = 'mk-preview';

  // 侧边栏导航
  const sidebar = el('div', 'mk-sidebar');
  sidebar.id = 'mk-sidebar';

  const sidebarAvatar = el('div', 'mk-sidebar-avatar');
  sidebarAvatar.innerHTML = '<div class="mk-avatar-circle"></div>';
  sidebar.appendChild(sidebarAvatar);

  const navItems = ['🏠', '🔍', '🔔', '💬', '⭐', '📋'];
  for (const icon of navItems) {
    const navItem = el('div', 'mk-nav-item');
    navItem.textContent = icon;
    sidebar.appendChild(navItem);
  }

  const sidebarIndicator = el('div', 'mk-sidebar-indicator');
  sidebar.appendChild(sidebarIndicator);
  mkPreview.appendChild(sidebar);

  // 主内容区
  const content = el('div', 'mk-content');

  // 顶栏
  const header = el('div', 'mk-header');
  header.id = 'mk-header';
  const headerTitle = el('span');
  headerTitle.textContent = '🏠 ホーム';
  header.appendChild(headerTitle);
  content.appendChild(header);

  // 页面头部
  const pageHeader = el('div', 'mk-page-header');
  pageHeader.id = 'mk-page-header';
  const pageTitle = el('span');
  pageTitle.textContent = '探索';
  pageHeader.appendChild(pageTitle);
  content.appendChild(pageHeader);

  // 帖子卡片
  const noteCard = el('div', 'mk-note-card');
  noteCard.id = 'mk-note-card';

  const noteHeader = el('div', 'mk-note-header');
  const noteAvatar = el('div', 'mk-note-avatar');
  noteHeader.appendChild(noteAvatar);
  const noteName = el('span', 'mk-note-name');
  noteName.textContent = 'Misskey User';
  noteHeader.appendChild(noteName);
  const noteTime = el('span', 'mk-note-time');
  noteTime.textContent = '3分前';
  noteHeader.appendChild(noteTime);
  noteCard.appendChild(noteHeader);

  const noteBody = el('div', 'mk-note-body');
  noteBody.innerHTML = `
    <p>Misskey テーマエディタへようこそ！🎨</p>
    <p>欢迎使用 <span class="mk-hashtag">#MisskeyThemeEditor</span></p>
    <p>这是一个 <span class="mk-link">链接示例</span> 和一个 <span class="mk-mention">@mention</span></p>
  `;
  noteCard.appendChild(noteBody);

  // 帖子操作栏
  const noteActions = el('div', 'mk-note-actions');
  const actions = [
    { icon: '💬', label: '返信' },
    { icon: '🔁', label: 'Renote' },
    { icon: '❤️', label: 'いいね' },
    { icon: '⋯', label: 'More' },
  ];
  for (const action of actions) {
    const btn = el('button', 'mk-action-btn');
    btn.textContent = `${action.icon}`;
    btn.title = action.label;
    noteActions.appendChild(btn);
  }
  noteCard.appendChild(noteActions);
  content.appendChild(noteCard);

  // 信息框
  const infoBox = el('div', 'mk-info-box');
  infoBox.id = 'mk-info-box';
  infoBox.textContent = 'ℹ️ 这是一个信息提示框';
  content.appendChild(infoBox);

  // 警告框
  const warnBox = el('div', 'mk-warn-box');
  warnBox.id = 'mk-warn-box';
  warnBox.textContent = '⚠️ 这是一个警告提示框';
  content.appendChild(warnBox);

  // 按钮组
  const buttonRow = el('div', 'mk-button-row');
  const primaryBtn = el('button', 'mk-btn mk-btn-primary');
  primaryBtn.textContent = '主要按钮';
  const secondaryBtn = el('button', 'mk-btn mk-btn-secondary');
  secondaryBtn.textContent = '次要按钮';
  buttonRow.append(primaryBtn, secondaryBtn);
  content.appendChild(buttonRow);

  // 开关
  const switchRow = el('div', 'mk-switch-row');
  const switchLabel = el('span');
  switchLabel.textContent = '通知';
  const switchTrack = el('div', 'mk-switch mk-switch-on');
  const switchThumb = el('div', 'mk-switch-thumb');
  switchTrack.appendChild(switchThumb);
  const switchTrackOff = el('div', 'mk-switch mk-switch-off');
  const switchThumbOff = el('div', 'mk-switch-thumb');
  switchTrackOff.appendChild(switchThumbOff);
  switchRow.append(switchLabel, switchTrack, switchTrackOff);
  content.appendChild(switchRow);

  // 输入框
  const inputRow = el('div', 'mk-input-row');
  const input = el('div', 'mk-input');
  input.textContent = '输入框示例...';
  inputRow.appendChild(input);
  content.appendChild(inputRow);

  // 代码块
  const codeBlock = el('div', 'mk-code-block');
  codeBlock.innerHTML = `<span class="mk-code-string">"Hello"</span> + <span class="mk-code-number">42</span> + <span class="mk-code-boolean">true</span>`;
  content.appendChild(codeBlock);

  // 徽章
  const badgeRow = el('div', 'mk-badge-row');
  const badge = el('span', 'mk-badge');
  badge.textContent = '3';
  badgeRow.appendChild(badge);
  const successBadge = el('span', 'mk-status-dot mk-success');
  const errorBadge = el('span', 'mk-status-dot mk-error');
  const warnBadge = el('span', 'mk-status-dot mk-warn');
  badgeRow.append(successBadge, errorBadge, warnBadge);
  content.appendChild(badgeRow);

  mkPreview.appendChild(content);
  previewContainer.appendChild(mkPreview);
  section.appendChild(previewContainer);

  return section;
}

function updatePreview() {
  const compiled = getCompiledTheme();
  const preview = document.getElementById('mk-preview');
  if (!preview) return;

  const setVar = (key: string, value: string) => {
    preview.style.setProperty(`--t-${key}`, value);
  };

  // 应用所有编译后的变量
  for (const [key, value] of Object.entries(compiled)) {
    setVar(key, value);
  }

  // 更新 HTML 主题色
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme && compiled.htmlThemeColor) {
    metaTheme.setAttribute('content', compiled.htmlThemeColor);
  }
}

// ─── Code Panel ──────────────────────────────────────────

let codePanelVisible = false;

function buildCodePanel(): HTMLElement {
  const section = el('div', 'code-section');

  const header = el('div', 'code-header');
  const toggle = el('button', 'code-toggle');
  toggle.textContent = codePanelVisible ? '▼ 收起代码' : '▶ 展开代码';
  toggle.addEventListener('click', () => {
    codePanelVisible = !codePanelVisible;
    buildApp();
  });
  header.appendChild(toggle);
  section.appendChild(header);

  if (codePanelVisible) {
    const codeContainer = el('div', 'code-container');

    const textarea = el('textarea', 'code-textarea') as HTMLTextAreaElement;
    textarea.id = 'code-textarea';
    textarea.spellcheck = false;
    textarea.value = generateThemeCode();

    const applyBtn = createButton('应用代码', 'ti ti-check', () => {
      try {
        const parsed = parseThemeCode(textarea.value);
        currentTheme = parsed;
        buildApp();
      } catch (err: any) {
        alert(`解析失败: ${err.message}`);
      }
    });

    codeContainer.append(textarea, applyBtn);
    section.appendChild(codeContainer);
  }

  return section;
}

function generateThemeCode(): string {
  const theme: Theme = {
    id: currentTheme.id,
    name: currentTheme.name,
    author: currentTheme.author,
    desc: currentTheme.desc,
    base: currentTheme.base,
    props: {} as Record<string, string>,
  };

  // 只包含与基础主题不同的属性
  const baseTheme = getBaseTheme(currentTheme.base ?? 'light');
  for (const key of themeProps) {
    const val = currentTheme.props[key];
    const baseVal = baseTheme.props[key];
    if (val && val !== baseVal) {
      theme.props[key] = val;
    }
  }

  return JSON5.stringify(theme, null, '\t');
}

function updateCodePanel() {
  const textarea = document.getElementById('code-textarea') as HTMLTextAreaElement | null;
  if (textarea) {
    textarea.value = generateThemeCode();
  }
}

// ─── Import / Export ─────────────────────────────────────

function importTheme() {
  const code = prompt('粘贴 JSON5 主题代码:');
  if (!code) return;

  try {
    const theme = parseThemeCode(code);
    currentTheme = theme;
    if (!currentTheme.id) currentTheme.id = genId();
    buildApp();
  } catch (err: any) {
    alert(`导入失败: ${err.message}`);
  }
}

function exportTheme() {
  const code = generateThemeCode();
  const blob = new Blob([code], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentTheme.name.replace(/[^a-zA-Z0-9]/g, '_')}.json5`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyCode() {
  const code = generateThemeCode();
  navigator.clipboard.writeText(code).then(() => {
    alert('已复制到剪贴板！');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('已复制到剪贴板！');
  });
}

// ─── Preset Menu ─────────────────────────────────────────

function showPresetMenu(anchor: HTMLElement) {
  // 移除已有菜单
  const existing = document.querySelector('.preset-menu');
  if (existing) { existing.remove(); return; }

  const menu = el('div', 'preset-menu');
  const rect = anchor.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.left = `${rect.left}px`;

  for (const preset of presetThemes) {
    const item = el('button', 'preset-item');

    const preview = el('div', 'preset-preview');
    const baseTheme = getBaseTheme(preset.theme.base ?? 'light');
    const merged = { ...baseTheme.props, ...preset.theme.props };
    const accent = merged.accent ?? '#86b300';
    const bg = merged.bg ?? '#fff';
    const fg = merged.fg ?? '#555';
    preview.style.background = `linear-gradient(135deg, ${bg} 50%, ${accent} 50%)`;

    const label = el('span');
    label.textContent = `${preset.nameZh} (${preset.name})`;

    item.append(preview, label);
    item.addEventListener('click', () => {
      applyPreset(preset);
      menu.remove();
    });

    menu.appendChild(item);
  }

  document.body.appendChild(menu);

  // 点击外部关闭
  setTimeout(() => {
    const close = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener('click', close);
      }
    };
    document.addEventListener('click', close);
  }, 0);
}

function applyPreset(preset: typeof presetThemes[number]) {
  const base = preset.theme.base ?? 'light';
  const baseTheme = getBaseTheme(base);

  currentTheme = {
    id: genId(),
    name: preset.name,
    author: '@me',
    base: base as 'light' | 'dark',
    props: { ...baseTheme.props, ...preset.theme.props },
  };

  buildApp();
}

// ─── Utility ─────────────────────────────────────────────

function el(tag: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

function createButton(text: string, icon: string, handler: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'toolbar-btn';
  btn.textContent = text;
  btn.addEventListener('click', handler);
  return btn;
}

// ─── Init ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // 添加 meta theme-color
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = '#86b300';
  document.head.appendChild(meta);

  buildApp();
});
