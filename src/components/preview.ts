/**
 * 预览组件
 */

import { el } from '../ui-utils';
import { getCompiledTheme } from '../helpers';

export function buildPreview(): HTMLElement {
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

export function updatePreview() {
  const compiled = getCompiledTheme();
  const preview = document.getElementById('mk-preview');
  if (!preview) return;

  // camelCase → kebab-case
  const toKebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  const setVar = (key: string, value: string) => {
    preview.style.setProperty(`--t-${toKebab(key)}`, value);
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
