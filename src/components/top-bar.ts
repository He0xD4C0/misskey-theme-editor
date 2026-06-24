/**
 * 顶栏组件
 */

import { el, createButton } from '../ui-utils';
import { showPresetMenu } from './preset-menu';
import { importTheme, importThemeFromFile, exportTheme, copyCode } from '../io';

export function buildTopBar(): HTMLElement {
  const bar = el('div', 'topbar');

  // Logo
  const logo = el('div', 'topbar-logo');
  logo.innerHTML = '🎨 Misskey Theme Editor';
  bar.appendChild(logo);

  // 操作按钮
  const actions = el('div', 'topbar-actions');

  // 预设下拉
  const presetBtn = createButton('预设主题', 'ti ti-palette', () => { showPresetMenu(presetBtn); });
  actions.appendChild(presetBtn);

  // 导入
  actions.appendChild(createButton('导入 JSON5', 'ti ti-upload', importTheme));

  // 打开文件
  actions.appendChild(createButton('打开文件', 'ti ti-file-import', importThemeFromFile));

  // 导出
  actions.appendChild(createButton('导出 JSON5', 'ti ti-download', exportTheme));

  // 复制到剪贴板
  actions.appendChild(createButton('复制代码', 'ti ti-copy', copyCode));

  bar.appendChild(actions);

  return bar;
}
