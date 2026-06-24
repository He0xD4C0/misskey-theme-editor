/**
 * 导入导出功能
 */

import { parseThemeCode, genId } from './theme-engine';
import { currentTheme, setCurrentTheme, getBaseTheme } from './state';
import { generateThemeCode } from './components/code-panel';
import { events, Events } from './events';

export function importTheme() {
  const code = prompt('粘贴 JSON5 主题代码:');
  if (!code) return;
  applyImportedCode(code);
}

export function importThemeFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json5,.json';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const code = reader.result as string;
      applyImportedCode(code);
    };
    reader.readAsText(file);
  });
  input.click();
}

function applyImportedCode(code: string) {
  try {
    const theme = parseThemeCode(code);
    // 合并基础主题属性，确保所有属性都有值
    const baseTheme = getBaseTheme(theme.base ?? 'light');
    theme.props = { ...baseTheme.props, ...theme.props };
    setCurrentTheme(theme);
    if (!currentTheme.id) currentTheme.id = genId();
    events.emit(Events.BUILD_APP);
  } catch (err: any) {
    alert(`导入失败: ${err.message}`);
  }
}

export function exportTheme() {
  const code = generateThemeCode();
  const blob = new Blob([code], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentTheme.name.replace(/[^a-zA-Z0-9]/g, '_')}.json5`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // 延迟释放 URL，确保浏览器有时间开始下载
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function copyCode() {
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
