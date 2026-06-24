/**
 * 代码面板组件
 */

import {
  type Theme,
  themeProps,
  parseThemeCode,
  genId,
} from '../theme-engine';
import JSON5 from 'json5';
import { el, createButton } from '../ui-utils';
import { currentTheme, getBaseTheme } from '../state';
import { events, Events } from '../events';

// mi_light.json5 定义的属性（始终输出）
const MI_LIGHT_PROPS = ['bg', 'fg', 'fgOnWhite', 'divider', 'header', 'navBg', 'panel', 'mentionMe'];

let codePanelCollapsed = false;

export function isCodePanelCollapsed(): boolean {
  return codePanelCollapsed;
}

export function buildCodePanel(): HTMLElement {
  const section = el('div', 'code-section');

  // 内部 toggle（隐藏，由外部按钮触发）
  const header = el('div', 'code-header');
  const toggle = el('button', 'code-toggle');
  toggle.textContent = codePanelCollapsed ? '◀ 展开代码' : '▶ 收起代码';
  toggle.style.display = 'none'; // 隐藏内部 toggle
  toggle.addEventListener('click', () => {
    codePanelCollapsed = !codePanelCollapsed;
    events.emit(Events.BUILD_APP);
  });
  header.appendChild(toggle);
  section.appendChild(header);

  if (!codePanelCollapsed) {
    const codeContainer = el('div', 'code-container');

    const textarea = el('textarea', 'code-textarea') as HTMLTextAreaElement;
    textarea.id = 'code-textarea';
    textarea.spellcheck = false;
    textarea.value = generateThemeCode();

    const applyBtn = createButton('应用代码', 'ti ti-check', () => {
      try {
        const parsed = parseThemeCode(textarea.value);
        // 合并基础主题属性，确保所有属性都有值
        const baseTheme = getBaseTheme(parsed.base ?? currentTheme.base ?? 'light');
        parsed.props = { ...baseTheme.props, ...parsed.props };
        Object.assign(currentTheme, parsed);
        if (!currentTheme.id) currentTheme.id = parsed.id;
        events.emit(Events.BUILD_APP);
      } catch (err: any) {
        alert(`解析失败: ${err.message}`);
      }
    });

    codeContainer.append(textarea, applyBtn);
    section.appendChild(codeContainer);
  }

  return section;
}

export function generateThemeCode(): string {
  const theme: Theme = {
    id: genId(),
    name: currentTheme.name,
    author: currentTheme.author,
    desc: currentTheme.desc,
    base: currentTheme.base,
    props: {} as Record<string, string>,
  };

  const baseTheme = getBaseTheme(currentTheme.base ?? 'light');

  // 始终包含 mi_light 定义的属性
  for (const key of MI_LIGHT_PROPS) {
    const val = currentTheme.props[key];
    const baseVal = baseTheme.props[key];
    theme.props[key] = val ?? baseVal ?? '';
  }

  // 额外包含用户修改的、不在 mi_light 中的属性
  for (const key of themeProps) {
    if (MI_LIGHT_PROPS.includes(key)) continue;
    const val = currentTheme.props[key];
    const baseVal = baseTheme.props[key];
    if (val && val !== baseVal) {
      theme.props[key] = val;
    }
  }

  return JSON5.stringify(theme, null, '\t');
}

export function updateCodePanel() {
  const textarea = document.getElementById('code-textarea') as HTMLTextAreaElement | null;
  if (textarea) {
    textarea.value = generateThemeCode();
  }
}
