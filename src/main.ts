/**
 * Misskey Theme Editor — 主应用入口
 * 集成可视化编辑器 + 实时预览
 */

import './style.css';

// 导入组件
import { buildTopBar } from './components/top-bar';
import { buildThemeInfoSection } from './components/theme-info';
import { buildPropertyEditor, updatePropEditors } from './components/property-editor';
import { buildPreview, updatePreview } from './components/preview';
import { buildCodePanel, updateCodePanel, isCodePanelCollapsed } from './components/code-panel';
import { events, Events } from './events';

// ─── Build App ───────────────────────────────────────────

export function buildApp() {
  const app = document.getElementById('app')!;

  // 保存各面板的滚动位置
  const scrollPositions = new Map<string, number>();
  app.querySelectorAll<HTMLElement>('.editor-panel, .preview-panel, .code-panel').forEach(el => {
    if (el.className) scrollPositions.set(el.className, el.scrollTop);
  });
  const mainScroll = app.querySelector('.main')?.scrollTop ?? 0;

  app.innerHTML = '';

  // 顶栏
  app.appendChild(buildTopBar());

  // 主区域
  const main = document.createElement('div');
  main.className = 'main';

  // 左侧编辑器
  const editor = document.createElement('div');
  editor.className = 'editor-panel';
  editor.appendChild(buildThemeInfoSection());
  editor.appendChild(buildPropertyEditor());
  main.appendChild(editor);

  // 右侧预览
  const preview = document.createElement('div');
  preview.className = 'preview-panel';
  preview.appendChild(buildPreview());
  main.appendChild(preview);

  // 右侧代码面板
  const codePanelWrapper = document.createElement('div');
  codePanelWrapper.className = 'code-panel-wrapper';
  
  const collapsed = isCodePanelCollapsed();
  
  // Toggle 按钮始终在外面
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'code-toggle-btn';
  toggleBtn.textContent = collapsed ? '◀' : '▶';
  toggleBtn.title = collapsed ? '展开代码面板' : '收起代码面板';
  toggleBtn.addEventListener('click', () => {
    // 触发 code-panel 内部的 toggle 逻辑
    const internalToggle = document.querySelector('.code-toggle') as HTMLButtonElement;
    if (internalToggle) internalToggle.click();
  });
  codePanelWrapper.appendChild(toggleBtn);
  
  // 代码面板内容
  const codePanel = document.createElement('div');
  codePanel.className = 'code-panel' + (collapsed ? ' collapsed' : '');
  codePanel.appendChild(buildCodePanel());
  codePanelWrapper.appendChild(codePanel);
  
  main.appendChild(codePanelWrapper);

  app.appendChild(main);

  // 恢复滚动位置
  app.querySelectorAll<HTMLElement>('.editor-panel, .preview-panel, .code-panel').forEach(el => {
    const saved = scrollPositions.get(el.className);
    if (saved != null) el.scrollTop = saved;
  });

  // 初始渲染
  updatePreview();
}

// ─── Event Listeners ─────────────────────────────────────

// 监听事件并执行相应操作
events.on(Events.BUILD_APP, () => buildApp());
events.on(Events.PROP_CHANGED, () => {
  updatePreview();
  updateCodePanel();
  updatePropEditors();
});

// ─── Init ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // 添加 meta theme-color
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = '#86b300';
  document.head.appendChild(meta);

  buildApp();
});
