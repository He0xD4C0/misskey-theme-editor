/**
 * 主题信息组件
 */

import { el, createButton } from '../ui-utils';
import { currentTheme, updateCurrentTheme, resetTheme, getBaseTheme } from '../state';
import { events, Events } from '../events';

export function buildThemeInfoSection(): HTMLElement {
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
    updateCurrentTheme({ name: nameInput.value });
    events.emit(Events.PROP_CHANGED);
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
    updateCurrentTheme({ author: authorInput.value });
    events.emit(Events.PROP_CHANGED);
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
    updateCurrentTheme({ desc: descInput.value || undefined });
    events.emit(Events.PROP_CHANGED);
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

  baseSwitch.append(lightBtn, darkBtn);
  baseGroup.append(baseLabel, baseSwitch);
  form.appendChild(baseGroup);

  section.appendChild(form);
  return section;
}

function switchBase(base: 'light' | 'dark') {
  if (currentTheme.base === base) return;

  const baseName = base === 'dark' ? '暗色' : '亮色';

  // 弹出选择对话框
  const choice = confirm(
    `切换为${baseName}主题基础\n\n` +
    `确定 = 重置背景、面板等参数为${baseName}默认值（保留 accent）\n` +
    `取消 = 仅切换基础，保持所有当前参数不变`
  );

  if (choice) {
    // 重置大部分参数，保留 accent
    resetTheme(base, ['accent']);
  } else {
    // 仅切换基础，保留所有参数
    currentTheme.base = base;
  }

  events.emit(Events.BUILD_APP);
}
