/**
 * 预设菜单组件
 */

import { el } from '../ui-utils';
import { currentTheme, getBaseTheme, setCurrentTheme } from '../state';
import { genId } from '../theme-engine';
import { onClickOutside } from '../ui-utils';
import { events, Events } from '../events';
import { loadExternalThemes, type ExternalPresetTheme } from '../preset-loader';

// 缓存加载的主题
let cachedThemes: ExternalPresetTheme[] | null = null;

export async function showPresetMenu(anchor: HTMLElement) {
  // 移除已有菜单
  const existing = document.querySelector('.preset-menu');
  if (existing) { existing.remove(); return; }

  // 加载主题（带缓存）
  if (!cachedThemes) {
    cachedThemes = await loadExternalThemes();
  }

  const menu = el('div', 'preset-menu');
  const rect = anchor.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.left = `${rect.left}px`;

  // 加载中提示
  if (cachedThemes.length === 0) {
    const empty = el('div', 'preset-empty');
    empty.textContent = '没有找到主题文件';
    menu.appendChild(empty);
  }

  for (const preset of cachedThemes) {
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
  onClickOutside(menu, () => menu.remove());
}

function applyPreset(preset: ExternalPresetTheme) {
  const base = preset.theme.base ?? 'light';
  const baseTheme = getBaseTheme(base);

  setCurrentTheme({
    id: genId(),
    name: preset.name,
    author: '@me',
    base: base as 'light' | 'dark',
    props: { ...baseTheme.props, ...preset.theme.props },
  });

  events.emit(Events.BUILD_APP);
}
